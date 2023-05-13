using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.Roles;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class CoursesService : ICoursesService
    {
        private readonly ICoursesRepository _coursesRepository;
        private readonly ICourseMatesRepository _courseMatesRepository;
        private readonly IEventBus _eventBus;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly ITasksRepository _tasksRepository;

        public CoursesService(ICoursesRepository coursesRepository,
            ICourseMatesRepository courseMatesRepository,
            IEventBus eventBus,
            IAuthServiceClient authServiceClient,
            ITasksRepository tasksRepository,
            IHomeworksRepository homeworksRepository
        )
        {
            _coursesRepository = coursesRepository;
            _courseMatesRepository = courseMatesRepository;
            _eventBus = eventBus;
            _authServiceClient = authServiceClient;
            _homeworksRepository = homeworksRepository;
            _tasksRepository = tasksRepository;
        }

        public async Task<Course[]> GetAllAsync()
        {
            return await _coursesRepository.GetAllWithCourseMatesAndHomeworks().ToArrayAsync();
        }

        public async Task<Course?> GetByTaskAsync(long taskId)
        {
            var task = await _tasksRepository.GetAsync(taskId);
            if (task == null) return null;

            var homework = await _homeworksRepository.GetAsync(task.HomeworkId);
            if (homework == null) return null;

            return await GetAsync(homework.CourseId);
        }

        public async Task<Course?> GetAsync(long id)
        {
            return await _coursesRepository.GetWithCourseMatesAsync(id);
        }

        public async Task<long> AddAsync(Course course, string mentorId)
        {
            course.MentorIds = mentorId;
            course.InviteCode = Guid.NewGuid().ToString();
            return await _coursesRepository.AddAsync(course);
        }

        public async Task DeleteAsync(long id)
        {
            await _coursesRepository.DeleteAsync(id);
        }

        public async Task UpdateAsync(long courseId, Course updated)
        {
            await _coursesRepository.UpdateAsync(courseId, c => new Course
            {
                Name = updated.Name,
                GroupName = updated.GroupName,
                IsCompleted = updated.IsCompleted,
                IsOpen = updated.IsOpen
            });
        }

        public async Task<bool> AddStudentAsync(long courseId, string studentId)
        {
            var getCourseTask = _coursesRepository.GetAsync(courseId);
            var getCourseMateTask =
                _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await Task.WhenAll(getCourseTask, getCourseMateTask);

            var course = getCourseTask.Result;
            if (course == null || getCourseMateTask.Result != null)
            {
                return false;
            }

            var courseMate = new CourseMate
            {
                CourseId = courseId,
                StudentId = studentId,
                IsAccepted = false
            };

            await _courseMatesRepository.AddAsync(courseMate);
            _eventBus.Publish(new NewCourseMateEvent
            {
                CourseId = courseId,
                CourseName = course.Name,
                MentorIds = course.MentorIds,
                StudentId = studentId,
                IsAccepted = false
            });

            return true;
        }

        public async Task<bool> AcceptCourseMateAsync(long courseId, string studentId)
        {
            var getCourseTask = _coursesRepository.GetAsync(courseId);
            var getCourseMateTask =
                _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await Task.WhenAll(getCourseTask, getCourseMateTask);

            if (getCourseTask.Result == null || getCourseMateTask.Result == null)
            {
                return false;
            }

            await _courseMatesRepository.UpdateAsync(
                getCourseMateTask.Result.Id,
                cm => new CourseMate { IsAccepted = true }
            );

            var course = getCourseTask.Result;
            var courseMate = new CourseMate
            {
                CourseId = courseId,
                StudentId = studentId,
                IsAccepted = false
            };

            _eventBus.Publish(new LecturerAcceptToCourseEvent
            {
                CourseId = courseId,
                CourseName = course.Name,
                MentorIds = course.MentorIds,
                StudentId = studentId
            });

            return true;
        }

        public async Task<bool> RejectCourseMateAsync(long courseId, string studentId)
        {
            var getCourseTask = _coursesRepository.GetAsync(courseId);
            var getCourseMateTask =
                _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await Task.WhenAll(getCourseTask, getCourseMateTask);

            if (getCourseTask.Result == null || getCourseMateTask.Result == null)
            {
                return false;
            }

            await _courseMatesRepository.DeleteAsync(getCourseMateTask.Result.Id);

            var course = getCourseTask.Result;
            _eventBus.Publish(new LecturerRejectToCourseEvent
            {
                CourseId = courseId,
                CourseName = course.Name,
                MentorIds = course.MentorIds,
                StudentId = studentId
            });

            return true;
        }

        public async Task<Course[]> GetUserCoursesAsync(string userId)
        {
            var studentCoursesIds = await _courseMatesRepository
                .FindAll(cm => cm.StudentId == userId && cm.IsAccepted == true)
                .Select(cm => cm.CourseId)
                .ToArrayAsync()
                .ConfigureAwait(false);

            var getStudentCoursesTasks = studentCoursesIds
                .Select(id => _coursesRepository.GetAsync(id)) // TODO: optimize 
                .ToArray();

            var studentCourses = await Task.WhenAll(getStudentCoursesTasks).ConfigureAwait(false);

            var getMentorCoursesTask = _coursesRepository
                .FindAll(c => c.MentorIds.Contains(userId))
                .Include(c => c.Homeworks).ThenInclude(t => t.Tasks)
                .ToArrayAsync();

            var mentorCourses = await getMentorCoursesTask.ConfigureAwait(false);

            return studentCourses.Union(mentorCourses).ToArray();
        }

        public async Task AcceptLecturerAsync(long courseId, string lecturerEmail)
        {
            var userId = await _authServiceClient.FindByEmailAsync(lecturerEmail);
            if (!(userId is null))
            {
                var course = await _coursesRepository.GetAsync(courseId);
                var user = await _authServiceClient.GetAccountData(userId);
                if (user.Role == Roles.LecturerRole && !course.MentorIds.Contains(userId))
                {
                    string newMentors = course.MentorIds + "/" + userId;
                    await _coursesRepository.UpdateAsync(courseId, с => new Course
                    {
                        MentorIds = newMentors,
                    });

                    _eventBus.Publish(new LecturerInvitedToCourseEvent
                    {
                        CourseId = courseId,
                        CourseName = course.Name,
                        MentorId = userId,
                        MentorEmail = lecturerEmail
                    });

                    //TODO: remove
                    await RejectCourseMateAsync(courseId, userId);
                }
            }
        }

        public async Task<string[]> GetCourseLecturers(long courseId)
        {
            var course = await _coursesRepository.GetAsync(courseId);

            return course.MentorIds
                .Split('/')
                .ToArray();
        }

        public async Task<AccountDataDto[]> GetLecturersAvailableForCourse(long courseId, string mentorId)
        {
            var lecturers = await _authServiceClient.GetAllLecturers();
            var mentorIds = await GetCourseLecturers(courseId);
            var availableLecturers = lecturers.Where(u => !mentorIds.Contains(u.Id));

            return availableLecturers
                .Select(u => new AccountDataDto(u.Id, u.Name, u.Surname, u.Email, Roles.LecturerRole, u.IsExternalAuth,
                    u.MiddleName))
                .ToArray();
        }
    }
}
