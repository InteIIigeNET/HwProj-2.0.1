using System;
using System.Collections.Generic;
using System.Linq;
using System.Transactions;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.API.Repositories.Groups;
using HwProj.Models.ContentService.DTO;
using HwProj.ContentService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.CoursesService.API.Domains;
using HwProj.Exceptions;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.Roles;
using HwProj.NotificationService.Events.CoursesService;
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
        private readonly IContentServiceClient _contentServiceClient;
        private readonly IGroupsRepository _groupsRepository;
        private readonly ICourseFilterService _courseFilterService;
        private readonly CourseContext _context;

        public CoursesService(ICoursesRepository coursesRepository,
            IHomeworksRepository homeworksRepository,
            ITasksRepository tasksRepository,
            ICourseMatesRepository courseMatesRepository,
            IEventBus eventBus,
            IContentServiceClient contentServiceClient,
            IGroupsRepository groupsRepository,
            ICourseFilterService courseFilterService,
            CourseContext context)
        {
            _coursesRepository = coursesRepository;
            _homeworksRepository = homeworksRepository;
            _tasksRepository = tasksRepository;
            _courseMatesRepository = courseMatesRepository;
            _eventBus = eventBus;
            _contentServiceClient = contentServiceClient;
            _groupsRepository = groupsRepository;
            _courseFilterService = courseFilterService;
            _context = context;
        }

        public async Task<Course[]> GetAllAsync()
        {
            // Для списка курсов достаточно полей самого курса, связанные сущности не нужны
            return await _coursesRepository.GetAll().ToArrayAsync();
        }

        public async Task<CourseDTO?> GetByTaskAsync(long taskId, string userId)
        {
            var courseId = await _tasksRepository.GetCourseIdAsync(taskId);
            if (courseId == null) return null;

            return await GetForUserAsync(courseId.Value, userId);
        }

        public Task<CourseDTO?> GetAsync(long id, string userId = "", bool asView = false) =>
            GetAsync(id, userId, CourseLoadFilter.Empty.WithCriteria(asView));

        public async Task<CourseDTO?> GetForUserAsync(long id, string userId, bool asView = false)
        {
            var access = await GetCourseAccessAsync(id, userId);
            if (access == null) return null;

            var now = DateTime.UtcNow;
            var loadFilter = CourseVisibility.GetLoadFilter(access.Value, userId, now).WithCriteria(asView);

            var course = await GetAsync(id, userId, loadFilter);
            return course == null ? null : CourseVisibility.HideInaccessibleData(course, userId, access.Value, now);
        }

        public async Task<CourseAccess?> GetCourseAccessAsync(long courseId, string userId)
        {
            var membership = await _coursesRepository.FindAll(c => c.Id == courseId)
                .Select(c => new
                {
                    c.MentorIds,
                    IsAcceptedStudent = c.CourseMates.Any(cm => cm.IsAccepted && cm.StudentId == userId)
                })
                .FirstOrDefaultAsync();

            return membership == null
                ? (CourseAccess?)null
                : CourseVisibility.GetAccess(userId, CourseMentors.Parse(membership.MentorIds),
                    membership.IsAcceptedStudent);
        }

        private async Task<CourseDTO?> GetAsync(long id, string userId, CourseLoadFilter loadFilter)
        {
            var course = await _coursesRepository.GetWithCourseMatesAndHomeworksAsync(id, loadFilter);
            if (course == null) return null;

            CourseDomain.FillTasksInCourses(course);

            var groupMateId = loadFilter.GroupMateId;
            var groups = await _groupsRepository.GetGroupsWithGroupMatesByCourse(course.Id)
                .Where(g => groupMateId == null || g.GroupMates.Any(gm => gm.StudentId == groupMateId))
                .ToListAsync();
            var courseDto = course.ToCourseDto();
            courseDto.Groups = groups.Select(g =>
                new GroupViewModel
                {
                    Id = g.Id,
                    Name = g.Name,
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

        public async Task<long> AddAsync(CreateCourseViewModel courseViewModel, string mentorId)
        {
            var courseTemplate = courseViewModel.ToCourseTemplate();
            Course? baseCourse = null;

            if (courseViewModel.BaseCourseId != null)
            {
                baseCourse = await _coursesRepository.GetWithHomeworksAsync(courseViewModel.BaseCourseId.Value);
                if (baseCourse == null) throw new InvalidOperationException("Базовый курс не найден");
                if (!baseCourse.HasMentor(mentorId))
                    throw new ForbiddenException(
                        $"Пользователь с id{mentorId} не является ментором указанного базового курса");
            }

            courseTemplate.Homeworks =
                baseCourse?.Homeworks.Select(h => h.ToHomeworkTemplate()).ToList() ??
                new List<HomeworkTemplate>();

            using var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            var newCourse = await AddFromTemplateAsync(courseTemplate, courseViewModel.StudentIDs, mentorId);

            if (baseCourse != null)
            {
                var sourceHwIds = baseCourse.Homeworks.Select(hw => hw.Id);
                var targetHwIds = newCourse.Homeworks.Select(hw => hw.Id);

                var homeworksMapping = sourceHwIds
                    .Zip(targetHwIds, (source, target) => new ScopeMappingDto
                    {
                        Source = source,
                        Target = target
                    }).ToList();

                if (homeworksMapping.Count > 0)
                {
                    var result = await _contentServiceClient.TransferFilesFromCourse(new CourseFilesTransferDto
                    {
                        SourceCourseId = baseCourse.Id,
                        TargetCourseId = newCourse.Id,
                        HomeworksMapping = homeworksMapping
                    });

                    if (!result.Succeeded) throw new TransactionAbortedException(string.Join("\n", result.Errors));
                }
            }

            transactionScope.Complete();
            return newCourse.Id;
        }

        private async Task<Course> AddFromTemplateAsync(CourseTemplate courseTemplate, List<string> studentIds,
            string mentorId)
        {
            using var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            var course = courseTemplate.ToCourse();
            course.MentorIds = mentorId;
            course.InviteCode = Guid.NewGuid().ToString();
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
                        MentorIds = course.MentorIds,
                        StudentId = student.StudentId
                    });
                }
            }

            transactionScope.Complete();

            var result = await _coursesRepository.GetAsync(courseId);
            return result;
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

            var now = DateTime.UtcNow;
            var loadFilter = CourseVisibility
                .GetLoadFilter(isMentor ? CourseAccess.Mentor : CourseAccess.Student, userId, now)
                .WithoutCharacteristics();

            var coursesWithValues = isMentor
                ? await _coursesRepository.GetAllWithCourseMatesAndHomeworksAsync(
                    CourseMentors.IsMentor(userId), loadFilter)
                : await _coursesRepository.GetAllWithCourseMatesAndHomeworksAsync(
                    c => c.CourseMates.Any(cm => cm.IsAccepted && cm.StudentId == userId), loadFilter);

            CourseDomain.FillTasksInCourses(coursesWithValues);

            // Уровень доступа определяется по исходным данным курса, до применения фильтров курса
            var accesses = coursesWithValues
                .Select(c => CourseVisibility.GetAccess(userId, c.GetMentorIds(),
                    c.CourseMates.Any(cm => cm.IsAccepted && cm.StudentId == userId)))
                .ToArray();

            var result = (await _courseFilterService.ApplyFiltersToCourses(
                    userId, coursesWithValues.Select(c => c.ToCourseDto()).ToArray()))
                .Select((courseDto, i) => CourseVisibility.HideInaccessibleData(courseDto, userId, accesses[i], now))
                .ToArray();

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
            if (!course.HasMentor(lecturerId))
            {
                var newMentors = course.WithMentor(lecturerId);
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
            var mentorIds = await _coursesRepository.GetMentorIdsAsync(courseId);
            return CourseMentors.Parse(mentorIds);
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

            var tags = string.Join(";", characteristics.Tags.Where(t => !string.IsNullOrWhiteSpace(t)).Distinct());

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
    }
}
