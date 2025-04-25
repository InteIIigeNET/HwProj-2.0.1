using System;
using System.Collections.Generic;
using System.Linq;
using System.Transactions;
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
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.Roles;
using HwProj.Utils.Authorization;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class CoursesService : ICoursesService
    {
        private readonly ICoursesRepository _coursesRepository;
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly ITasksRepository _tasksRepository;
        private readonly ICourseMatesRepository _courseMatesRepository;
        private readonly IEventBus _eventBus;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IGroupsRepository _groupsRepository;
        private readonly ICourseFilterService _courseFilterService;
        private readonly CourseContext _context;

        public CoursesService(ICoursesRepository coursesRepository,
            IHomeworksRepository homeworksRepository,
            ITasksRepository tasksRepository,
            ICourseMatesRepository courseMatesRepository,
            IEventBus eventBus,
            IAuthServiceClient authServiceClient,
            IGroupsRepository groupsRepository,
            ICourseFilterService courseFilterService,
            CourseContext context)
        {
            _coursesRepository = coursesRepository;
            _homeworksRepository = homeworksRepository;
            _tasksRepository = tasksRepository;
            _courseMatesRepository = courseMatesRepository;
            _eventBus = eventBus;
            _authServiceClient = authServiceClient;
            _groupsRepository = groupsRepository;
            _courseFilterService = courseFilterService;
            _context = context;
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

        public async Task<CourseDTO?> GetForEditingAsync(long id)
        {
            var course = await _coursesRepository.GetWithHomeworksAsync(id);
            return course?.ToCourseDto();
        }

        public async Task<long> AddAsync(CreateCourseViewModel courseViewModel,
            CourseDTO? baseCourse,
            string mentorId)
        {
            var courseTemplate = courseViewModel.ToCourseTemplate();

            if (baseCourse != null)
            {
                courseTemplate.Homeworks = baseCourse.Homeworks.Select(h => h.ToHomeworkTemplate()).ToList();
            }

            return await AddFromTemplateAsync(courseTemplate, courseViewModel.StudentIDs, mentorId);
        }

        public async Task<long> AddFromTemplateAsync(CourseTemplate courseTemplate, List<string> studentIds,
            string mentorId)
        {
            using var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            var course = courseTemplate.ToCourse();
            course.InviteCode = Guid.NewGuid().ToString();
            course.Mentors = new List<CourseMentor> { new CourseMentor { UserId = mentorId } };
            var courseId = await _coursesRepository.AddAsync(course);

            var homeworks = courseTemplate.Homeworks.Select(hwTemplate => hwTemplate.ToHomework(courseId));
            var homeworkIds = await _homeworksRepository.AddRangeAsync(homeworks);

            var tasks = courseTemplate.Homeworks.SelectMany((hwTemplate, i) =>
                hwTemplate.Tasks.Select(taskTemplate => taskTemplate.ToHomeworkTask(homeworkIds[i])));
            await _tasksRepository.AddRangeAsync(tasks);

            if (studentIds.Any())
            {
                var students = studentIds.Select(studentId => new CourseMate
                {
                    CourseId = courseId,
                    StudentId = studentId,
                    IsAccepted = true
                }).ToArray();

                await _courseMatesRepository.AddRangeAsync(students);

                foreach (var student in students)
                {
                    _eventBus.Publish(new LecturerAcceptToCourseEvent
                    {
                        CourseId = courseId,
                        CourseName = course.Name,
                        StudentId = student.StudentId
                    });
                }
            }

            transactionScope.Complete();
            return courseId;
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
                MentorIds = course.Mentors.Select(x => x.UserId).ToArray(),
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
                StudentId = studentId
            });
            return true;
        }

        public async Task<CourseDTO[]> GetUserCoursesAsync(string userId, string role)
        {
            var isMentor = role == Roles.LecturerRole || role == Roles.ExpertRole;

            var courses = isMentor
                ? _coursesRepository.FindAll(c => c.Mentors.Any(m => m.UserId == userId))
                : _coursesRepository.FindAll(c => c.CourseMates.Any(cm => cm.IsAccepted && cm.StudentId == userId));

            var coursesWithValues = await courses
                .Include(c => c.Mentors)
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
            if (course.Mentors.All(x => x.UserId != lecturerId))
            {
                await _context.CourseMentors.AddAsync(new CourseMentor() { CourseId = courseId, UserId = lecturerId });
                await _context.SaveChangesAsync();

                _eventBus.Publish(new LecturerInvitedToCourseEvent
                {
                    CourseId = courseId,
                    CourseName = course.Name,
                    MentorId = lecturerId,
                    MentorEmail = lecturerEmail
                });
            }

            return true;
        }

        public async Task<string[]> GetCourseLecturers(long courseId)
        {
            var course = await _coursesRepository.GetAsync(courseId);
            return course.Mentors.Select(x => x.UserId).ToArray();
        }

        public async Task<bool> HasStudent(long courseId, string studentId)
        {
            var student =
                await _courseMatesRepository.FindAsync(x => x.CourseId == courseId && x.StudentId == studentId);
            return student != null;
        }

        public async Task<bool> UpdateStudentCharacteristics(long courseId, string studentId,
            StudentCharacteristicsDto characteristics)
        {
            var courseMate =
                await _courseMatesRepository.FindAll(x => x.CourseId == courseId && x.StudentId == studentId)
                    .Include(x => x.Characteristics)
                    .SingleOrDefaultAsync();

            if (courseMate == null) return false;

            var tags = string.Join(";", characteristics.Tags.Distinct());

            var hasCharacteristic = courseMate.Characteristics != null;

            courseMate.Characteristics ??= new StudentCharacteristics();
            courseMate.Characteristics.CourseMateId = courseMate.Id;
            courseMate.Characteristics.Description = characteristics.Description;
            courseMate.Characteristics.Tags = tags;

            _context.Attach(courseMate);
            _context.Entry(courseMate).State = EntityState.Modified;
            _context.Entry(courseMate.Characteristics).State =
                hasCharacteristic ? EntityState.Modified : EntityState.Added;

            await _context.SaveChangesAsync();
            return true;
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
