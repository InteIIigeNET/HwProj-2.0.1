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
    public enum ApplyFilterOperation
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
            var result = new List<CourseDTO>();
            foreach (var course in courses)
            {
                result.Add(await ApplyFilter(course, userId));
            }

            return result.ToArray();
        }

        public async Task<CourseDTO> ApplyFilter(CourseDTO course, string userId)
        {
            var isMentor = course.MentorIds.Contains(userId);
            var isCourseStudent = course.AcceptedStudents.Any(t => t.StudentId == userId);

            var findFiltersFor = isMentor || !isCourseStudent
                ? new[] { userId, GlobalFilterUserId }
                : course.MentorIds.Concat(new[] { userId, GlobalFilterUserId }).ToArray();

            var courseFilters =
                (await _courseFilterRepository.GetAsync(findFiltersFor, course.Id))
                .ToDictionary(x => x.UserId, x => x.CourseFilter);

            if (!isMentor)
            {
                var studentCourse = course;
                if (courseFilters.TryGetValue(GlobalFilterUserId, out var groupFilter))
                    studentCourse = ApplyFilterInternal(course, studentCourse, groupFilter,
                        ApplyFilterOperation.Subtract);

                studentCourse = courseFilters.TryGetValue(userId, out var studentFilter)
                    ? ApplyFilterInternal(course, studentCourse, studentFilter, ApplyFilterOperation.Union)
                    : studentCourse;

                var mentorIds = course.MentorIds
                    .Where(u =>
                        // Фильтрация не настроена вообще
                        !courseFilters.TryGetValue(u, out var courseFilter) ||
                        // Не отфильтрованы студенты
                        !courseFilter.Filter.StudentIds.Any() ||
                        // Фильтр содержит студента
                        courseFilter.Filter.StudentIds.Contains(userId))
                    .ToArray();

                studentCourse.MentorIds = mentorIds;
                return studentCourse;
            }

            return courseFilters.TryGetValue(userId, out var userFilter)
                ? ApplyFilterInternal(course, course, userFilter, ApplyFilterOperation.Intersect)
                : course;
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

        private CourseDTO ApplyFilterInternal(CourseDTO initialCourseDto, CourseDTO editingCourseDto,
            CourseFilter? courseFilter, ApplyFilterOperation filterType)
        {
            var filter = courseFilter?.Filter;

            if (filter == null)
                return editingCourseDto;

            var homeworks = filter.HomeworkIds.Count != 0
                ? filterType switch
                {
                    ApplyFilterOperation.Intersect => editingCourseDto.Homeworks
                        .Where(hw => filter.HomeworkIds.Contains(hw.Id))
                        .ToArray(),

                    ApplyFilterOperation.Subtract => editingCourseDto.Homeworks
                        .Where(hw => !filter.HomeworkIds.Contains(hw.Id))
                        .ToArray(),

                    ApplyFilterOperation.Union => editingCourseDto.Homeworks
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
                                        Name = gs.Name,
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

        public async Task UpdateGroupFilters(long courseId, long homeworkId, IEnumerable<string> studentIds)
        {
            var filterIds = studentIds.Union(new[] { GlobalFilterUserId }).ToArray();
            var filters = (await _courseFilterRepository.GetAsync(filterIds, courseId))
                .ToDictionary(x => x.UserId, x => x.CourseFilter);

            foreach (var filterId in filterIds)
            {
                await AddOrUpdateHomeworkToFilter(filters.GetValueOrDefault(filterId), filterId, courseId, homeworkId);
            }
        }

        private async Task AddOrUpdateHomeworkToFilter(CourseFilter filter, string userId, long courseId,
            long homeworkId)
        {
            if (filter != null)
            {
                await UpdateFilterWithHomework(filter, homeworkId);
            }
            else
            {
                await CreateFilterWithHomework(userId, courseId, homeworkId);
            }
        }

        private async Task UpdateFilterWithHomework(CourseFilter courseFilter, long homeworkId)
        {
            if (!courseFilter.Filter.HomeworkIds.Contains(homeworkId))
            {
                courseFilter.Filter.HomeworkIds.Add(homeworkId);
                await UpdateAsync(courseFilter.Id, courseFilter.Filter);
            }
        }

        private async Task CreateFilterWithHomework(string userId, long courseId, long homeworkId)
        {
            var newFilter = new Filter
            {
                StudentIds = new List<string>(),
                HomeworkIds = new List<long> { homeworkId },
                MentorIds = new List<string>()
            };

            await AddCourseFilter(newFilter, courseId, userId);
        }
    }
}
