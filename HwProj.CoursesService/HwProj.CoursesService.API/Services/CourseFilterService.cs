using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using System.Collections.Generic;

namespace HwProj.CoursesService.API.Services
{
    public enum ApplyFilterType
    {
        Intersect,
        Union,
        Subtract
    }
    public class CourseFilterService : ICourseFilterService
    {
        private const string GlobalFilterUserId = "";
        private readonly ICourseFilterRepository _courseFilterRepository;

        public CourseFilterService(
            ICourseFilterRepository courseFilterRepository)
        {
            _courseFilterRepository = courseFilterRepository;
        }

        public async Task<Result<long>> CreateOrUpdateCourseFilter(CreateCourseFilterModel courseFilterModel)
        {
            var filter = CourseFilterUtils.CreateFilter(courseFilterModel);

            var existingCourseFilter =
                await _courseFilterRepository.GetAsync(courseFilterModel.UserId, courseFilterModel.CourseId);
            if (existingCourseFilter != null)
            {
                await UpdateAsync(existingCourseFilter.Id, filter);
                return Result<long>.Success(existingCourseFilter.Id);
            }

            var filterId = await AddCourseFilter(filter, courseFilterModel.CourseId, courseFilterModel.UserId);
            if (filterId == -1)
            {
                return Result<long>.Failed();
            }

            return Result<long>.Success(filterId);
        }

        public async Task UpdateAsync(long courseFilterId, Filter filter)
        {
            var courseFilter = new CourseFilter
            {
                Id = courseFilterId,
                Filter = filter
            };

            await _courseFilterRepository.UpdateAsync(courseFilterId, f =>
                new CourseFilter
                {
                    FilterJson = courseFilter.FilterJson
                });
        }

        public async Task<CourseDTO[]> ApplyFiltersToCourses(string userId, CourseDTO[] courses)
        {
            var courseIds = courses.Select(c => c.Id).ToArray();

            var result = new List<CourseDTO>();
            foreach (var course in courses)
            {
                result.Add(await ApplyFilter(course, userId));
            }
            return result.ToArray();
        }

        public async Task<CourseDTO> ApplyFilter(CourseDTO courseDto, string userId)
        {
            var isMentor = courseDto.MentorIds.Contains(userId);
            var isCourseStudent = courseDto.AcceptedStudents.Any(t => t.StudentId == userId);
            var findFiltersFor = isMentor || !isCourseStudent
                ? new[] { userId }
                : courseDto.MentorIds.Concat(new[] { userId }).ToArray();

            var courseFilters =
                (await _courseFilterRepository.GetAsync(findFiltersFor, courseDto.Id))
                .ToDictionary(x => x.UserId, x => x.CourseFilter);

            if (!isMentor)
            {
                var studentCourse = courseDto;
                var groupFilter = await _courseFilterRepository.GetAsync(GlobalFilterUserId, courseDto.Id); // Глобальный фильтр для вычитания групповых домашних заданий
                if (groupFilter != null)
                {
                    studentCourse = ApplyFilterInternal(courseDto, studentCourse, groupFilter, ApplyFilterType.Subtract);
                }
                return courseFilters.TryGetValue(userId, out var studentFilter)
                        ? ApplyFilterInternal(courseDto, studentCourse, studentFilter, ApplyFilterType.Union)
                        : studentCourse;
            }

            var course = courseFilters.TryGetValue(userId, out var userFilter)
                ? ApplyFilterInternal(courseDto, courseDto, userFilter, ApplyFilterType.Intersect)
                : courseDto;
            if (isMentor || !isCourseStudent) return course;

            var mentorIds = course.MentorIds
                .Where(u =>
                    // Фильтрация не настроена вообще
                    !courseFilters.TryGetValue(u, out var courseFilter) ||
                    // Не отфильтрованы студенты
                    !courseFilter.Filter.StudentIds.Any() ||
                    // Фильтр содержит студента
                    courseFilter.Filter.StudentIds.Contains(userId))
                .ToArray();

            courseDto.MentorIds = mentorIds;
            return course;
        }

        public async Task<MentorToAssignedStudentsDTO[]> GetAssignedStudentsIds(long courseId, string[] mentorsIds)
        {
            var usersCourseFilters = await _courseFilterRepository.GetAsync(mentorsIds, courseId);

            return usersCourseFilters
                .Where(u => u.CourseFilter.Filter.HomeworkIds.Count == 0)
                .Select(u => new MentorToAssignedStudentsDTO
                {
                    MentorId = u.UserId,
                    SelectedStudentsIds = u.CourseFilter.Filter.StudentIds
                })
                .ToArray();
        }

        private async Task<long> AddCourseFilter(Filter filter, long courseId, string userId)
        {
            var courseFilterId =
                await _courseFilterRepository.AddAsync(new CourseFilter { Filter = filter }, userId, courseId);
            return courseFilterId;
        }

        private CourseDTO ApplyFilterInternal(CourseDTO initialCourseDto, CourseDTO editingCourseDto, CourseFilter? courseFilter, ApplyFilterType filterType)
        {
            var filter = courseFilter?.Filter;

            if (filter == null)
            {
                return editingCourseDto;
            }

            var homeworks = filter.HomeworkIds.Any()
                ? filterType switch
                {
                    ApplyFilterType.Intersect => editingCourseDto.Homeworks
                        .Where(hw => filter.HomeworkIds.Contains(hw.Id))
                        .ToArray(),

                    ApplyFilterType.Subtract => editingCourseDto.Homeworks
                        .Where(hw => !filter.HomeworkIds.Contains(hw.Id))
                        .ToArray(),

                    ApplyFilterType.Union => editingCourseDto.Homeworks
                        .Concat(initialCourseDto.Homeworks
                            .Where(hw => filter.HomeworkIds.Contains(hw.Id)))
                        .ToArray(),

                    _ => editingCourseDto.Homeworks
                }
                : editingCourseDto.Homeworks;

            return new CourseDTO
            {
                Id = editingCourseDto.Id,
                Name = editingCourseDto.Name,
                GroupName = editingCourseDto.GroupName,
                IsCompleted = editingCourseDto.IsCompleted,
                IsOpen = editingCourseDto.IsOpen,
                InviteCode = editingCourseDto.InviteCode,
                Groups =
                    (filter.StudentIds.Any()
                        ? editingCourseDto.Groups.Select(gs =>
                            {
                                var filteredStudentsIds = gs.StudentsIds.Intersect(filter.StudentIds).ToArray();
                                return filteredStudentsIds.Any()
                                    ? new GroupViewModel
                                    {
                                        Id = gs.Id,
                                        StudentsIds = filteredStudentsIds
                                    }
                                    : null;
                            })
                            .Where(t => t != null)
                            .ToArray()
                        : editingCourseDto.Groups)!,
                MentorIds = filter.MentorIds.Any()
                    ? editingCourseDto.MentorIds.Intersect(filter.MentorIds).ToArray()
                    : editingCourseDto.MentorIds,
                CourseMates =
                    filter.StudentIds.Any()
                        ? editingCourseDto.CourseMates
                            .Where(mate => !mate.IsAccepted || filter.StudentIds.Contains(mate.StudentId)).ToArray()
                        : editingCourseDto.CourseMates,
                Homeworks = homeworks.OrderBy(hw => hw.PublicationDate).ToArray()
            };
        }

        public async Task UpdateGroupFilters(long courseId, long homeworkId, GroupMate[] groupMates)
        {
            // Добавление группового домашнего задания в глобальный фильтр курса
            var globalFilter = await _courseFilterRepository.GetAsync(GlobalFilterUserId, courseId);

            if (globalFilter != null)
            {
                var filter = globalFilter.Filter;

                if (!filter.HomeworkIds.Contains(homeworkId))
                    filter.HomeworkIds.Add(homeworkId);

                await _courseFilterRepository.UpdateAsync(globalFilter.Id, f =>
                    new CourseFilter
                    {
                        FilterJson = new CourseFilter { Filter = filter }.FilterJson
                    });
            }
            else
            {
                var newFilter = new Filter
                {
                    StudentIds = new List<string>(),
                    HomeworkIds = new List<long> { homeworkId },
                    MentorIds = new List<string>(),
                };

                await _courseFilterRepository.AddAsync(new CourseFilter { Filter = newFilter }, GlobalFilterUserId, courseId);
            }

            // Добавление группового домашнего задания в персональные фильтры участников группы
            var studentIds = groupMates.Select(gm => gm.StudentId).ToArray();
            var studentFilters = (await _courseFilterRepository.GetAsync(studentIds, courseId))
                .ToDictionary(x => x.UserId, x => x.CourseFilter);

            foreach (var groupMate in groupMates)
            {
                if (studentFilters.TryGetValue(groupMate.StudentId, out var studentFilter))
                {
                    var filter = studentFilter.Filter;
                    if (!filter.HomeworkIds.Contains(homeworkId))
                        filter.HomeworkIds.Add(homeworkId);

                    await _courseFilterRepository.UpdateAsync(studentFilter.Id, f =>
                        new CourseFilter
                        {
                            FilterJson = new CourseFilter { Filter = filter }.FilterJson
                        });
                }
                else
                {
                    var newFilter = new Filter
                    {
                        StudentIds = new List<string>(),
                        HomeworkIds = new List<long> { homeworkId },
                        MentorIds = new List<string>()
                    };

                    await _courseFilterRepository.AddAsync(
                        new CourseFilter { Filter = newFilter },
                        groupMate.StudentId,
                        courseId
                    );
                }
            }
        }
    }
}
