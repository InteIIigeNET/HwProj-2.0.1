using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using System.Collections.Generic;
using HwProj.CoursesService.API.Domains;

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
        private readonly ICourseFilterRepository _courseFilterRepository;
        private readonly IHomeworksService _homeworksService;

        public CourseFilterService(
            ICourseFilterRepository courseFilterRepository,
            IHomeworksService homeworksService)
        {
            _courseFilterRepository = courseFilterRepository;
            _homeworksService = homeworksService;
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

            var filters = (await _courseFilterRepository.GetAsync(userId, courseIds))
                .ToDictionary(x => x.CourseId, x => x.CourseFilter);
            return (await Task.WhenAll(courses.Select(course => ApplyFilter(course, userId)))).ToArray();
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

            if (isCourseStudent)
            {
                var studentCourse = courseDto;
                var groupFilter = await _courseFilterRepository.GetAsync("", courseDto.Id); // Глобальный фильтр для вычитания групповых домашних заданий
                if (groupFilter != null)
                {
                    studentCourse = await ApplyFilterInternal(courseDto, groupFilter, ApplyFilterType.Subtract);
                }
                return courseFilters.TryGetValue(userId, out var studentFilter)
                        ? await ApplyFilterInternal(studentCourse, studentFilter, ApplyFilterType.Union)
                        : studentCourse;
            }

            var course = courseFilters.TryGetValue(userId, out var userFilter)
                ? await ApplyFilterInternal(courseDto, userFilter, ApplyFilterType.Intersect)
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

        private async Task<CourseDTO> ApplyFilterInternal(CourseDTO courseDto, CourseFilter? courseFilter, ApplyFilterType filterType)
        {
            var filter = courseFilter?.Filter;

            if (filter == null)
            {
                return courseDto;
            }

            var homeworks = filter.HomeworkIds.Any()
                ? filterType switch
                {
                    ApplyFilterType.Intersect => courseDto.Homeworks
                        .Where(hw => filter.HomeworkIds.Contains(hw.Id))
                        .ToArray(),

                    ApplyFilterType.Subtract => courseDto.Homeworks
                        .Where(hw => !filter.HomeworkIds.Contains(hw.Id))
                        .ToArray(),

                    ApplyFilterType.Union => courseDto.Homeworks
                        .Union(await GetHomeworksSequentially(filter.HomeworkIds))
                        .ToArray(),

                    _ => courseDto.Homeworks
                }
                : courseDto.Homeworks;

            return new CourseDTO
            {
                Id = courseDto.Id,
                Name = courseDto.Name,
                GroupName = courseDto.GroupName,
                IsCompleted = courseDto.IsCompleted,
                IsOpen = courseDto.IsOpen,
                InviteCode = courseDto.InviteCode,
                Groups =
                    (filter.StudentIds.Any()
                        ? courseDto.Groups.Select(gs =>
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
                        : courseDto.Groups)!,
                MentorIds = filter.MentorIds.Any()
                    ? courseDto.MentorIds.Intersect(filter.MentorIds).ToArray()
                    : courseDto.MentorIds,
                CourseMates =
                    filter.StudentIds.Any()
                        ? courseDto.CourseMates
                            .Where(mate => !mate.IsAccepted || filter.StudentIds.Contains(mate.StudentId)).ToArray()
                        : courseDto.CourseMates,
                Homeworks = homeworks
            };
        }

        private async Task<IEnumerable<HomeworkViewModel>> GetHomeworksSequentially(List<long> homeworkIds)
        {
            var result = new List<HomeworkViewModel>();
            foreach (var id in homeworkIds)
            {
                var hw = await _homeworksService.GetHomeworkAsync(id);
                if (hw != null)
                    result.Add(hw.ToHomeworkViewModel());
            }
            return result;
        }
    }
}
