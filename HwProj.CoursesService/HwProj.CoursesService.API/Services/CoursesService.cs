using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.API.Repositories.Groups;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.CoursesService.API.Domains;
using HwProj.Models.Roles;
using HwProj.Utils.Authorization;
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
        private readonly IGroupsRepository _groupsRepository;
        private readonly ICourseFilterService _courseFilterService;

        public CoursesService(ICoursesRepository coursesRepository,
            ICourseMatesRepository courseMatesRepository,
            IEventBus eventBus,
            IAuthServiceClient authServiceClient,
            ITasksRepository tasksRepository,
            IHomeworksRepository homeworksRepository,
            IGroupsRepository groupsRepository,
            ICourseFilterService courseFilterService)
        {
            _coursesRepository = coursesRepository;
            _courseMatesRepository = courseMatesRepository;
            _eventBus = eventBus;
            _authServiceClient = authServiceClient;
            _homeworksRepository = homeworksRepository;
            _tasksRepository = tasksRepository;
            _groupsRepository = groupsRepository;
            _courseFilterService = courseFilterService;
        }

        public async Task<Course[]> GetAllAsync()
        {
            var courses = await _coursesRepository.GetAllWithCourseMatesAndHomeworks().ToArrayAsync();
            CourseDomain.FillTasksInCourses(courses);
            return courses;
        }

        public async Task<CourseDTO?> GetByTaskAsync(long taskId, string userId)
        {
            var task = await _tasksRepository.GetWithHomeworkAsync(taskId);
            if (task == null) return null;

            return await GetAsync(task.Homework.CourseId, userId);
        }

        public async Task<CourseDTO?> GetAsync(long id, string userId = "")
        {
            var course = await _coursesRepository.GetWithCourseMatesAndHomeworksAsync(id);
            if (course == null) return null;

            CourseDomain.FillTasksInCourses(course);

            var groups = await _groupsRepository.GetGroupsWithGroupMatesByCourse(course.Id).ToArrayAsync();
            var courseDto = course.ToCourseDto();
            courseDto.Groups = groups.Select(g =>
                new GroupViewModel
                {
                    Id = g.Id,
                    StudentsIds = g.GroupMates.Select(t => t.StudentId).ToArray()
                }).ToArray();

            var result = userId == string.Empty ? courseDto : await _courseFilterService.ApplyFilter(courseDto, userId);
            return result;
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
            var course = await _coursesRepository.GetAsync(courseId);
            var cm = await _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);

            if (course == null || cm != null)
                return false;

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
            var course = await _coursesRepository.GetAsync(courseId);
            var cm = await _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);

            if (course == null || cm == null)
                return false;

            await _courseMatesRepository.UpdateAsync(cm.Id, cm => new CourseMate { IsAccepted = true });

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
            var course = await _coursesRepository.GetAsync(courseId);
            var cm = await _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);

            if (course == null || cm == null)
                return false;

            await _courseMatesRepository.DeleteAsync(cm.Id);

            _eventBus.Publish(new LecturerRejectToCourseEvent
            {
                CourseId = courseId,
                CourseName = course.Name,
                MentorIds = course.MentorIds,
                StudentId = studentId
            });
            return true;
        }

        public async Task<CourseDTO[]> GetUserCoursesAsync(string userId, string role)
        {
            var isMentor = role == Roles.LecturerRole || role == Roles.ExpertRole;

            var courses = isMentor
                ? _coursesRepository.FindAll(c => c.MentorIds.Contains(userId))
                : _coursesRepository.FindAll(c => c.CourseMates.Any(cm => cm.IsAccepted && cm.StudentId == userId));

            var coursesWithValues = await courses
                .Include(c => c.CourseMates)
                .Include(c => c.Homeworks).ThenInclude(t => t.Tasks)
                .ToArrayAsync();

            CourseDomain.FillTasksInCourses(coursesWithValues);

            var result = await _courseFilterService.ApplyFiltersToCourses(
                userId, coursesWithValues.Select(c => c.ToCourseDto()).ToArray());

            if (role == Roles.ExpertRole)
            {
                foreach (var courseDto in result)
                {
                    courseDto.TaskId = courseDto.Homeworks
                        .SelectMany(h => h.Tasks)
                        .FirstOrDefault()?.Id;
                }
            }

            return result;
        }

        public async Task<bool> AcceptLecturerAsync(long courseId, string lecturerEmail, string lecturerId)
        {
            var course = await _coursesRepository.GetAsync(courseId);
            if (course == null) return false;
            if (!course.MentorIds.Contains(lecturerId))
            {
                var newMentors = course.MentorIds + "/" + lecturerId;
                await _coursesRepository.UpdateAsync(courseId, с => new Course
                {
                    MentorIds = newMentors,
                });

                _eventBus.Publish(new LecturerInvitedToCourseEvent
                {
                    CourseId = courseId,
                    CourseName = course.Name,
                    MentorId = lecturerId,
                    MentorEmail = lecturerEmail
                });
                //TODO: remove
                await RejectCourseMateAsync(courseId, lecturerId);
            }

            return true;
        }

        public async Task<string[]> GetCourseLecturers(long courseId)
        {
            var course = await _coursesRepository.GetAsync(courseId);

            return course.MentorIds
                .Split('/')
                .ToArray();
        }

        public async Task<bool> HasStudent(long courseId, string studentId)
        {
            var student = await _courseMatesRepository.FindAsync(x => x.StudentId == studentId);
            return student != null;
        }

        public async Task<AccountDataDto[]> GetLecturersAvailableForCourse(long courseId, string mentorId)
        {
            var lecturers = await _authServiceClient.GetAllLecturers();
            var mentorIds = await GetCourseLecturers(courseId);
            var availableLecturers = lecturers.Where(u => !mentorIds.Contains(u.Id));

            return availableLecturers
                .Select(u => u.ToAccountDataDto(Roles.LecturerRole))
                .ToArray();
        }
    }
}
