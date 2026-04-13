using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using System.Collections.Generic;
using System;

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
        private const string GlobalFilterId = "";
        private readonly ICourseFilterRepository _courseFilterRepository;
        private readonly IGroupsService _groupsService;

        public CourseFilterService(
            ICourseFilterRepository courseFilterRepository, IGroupsService groupsService)
        {
            _courseFilterRepository = courseFilterRepository;
            _groupsService = groupsService;
        }

        public async Task<Result<long>> CreateOrUpdateCourseFilter(CreateCourseFilterModel courseFilterModel)
        {
            var filter = CourseFilterUtils.CreateFilter(courseFilterModel);

            var existingCourseFilter =
                await _courseFilterRepository.GetAsync(courseFilterModel.Id, courseFilterModel.CourseId);
            if (existingCourseFilter != null)
            {
                await UpdateAsync(existingCourseFilter.Id, filter);
                return Result<long>.Success(existingCourseFilter.Id);
            }

            var filterId = await AddCourseFilter(filter, courseFilterModel.CourseId, courseFilterModel.Id);
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

            // Получаем группы пользователя, чтобы найти фильтры для них
            var studentGroups = await _groupsService.GetStudentGroupsAsync(course.Id, userId);
            var groupIds = studentGroups.Select(g => g.Id.ToString()).ToArray();

            var findFiltersFor = isMentor || !isCourseStudent
                ? new[] { userId, GlobalFilterId }
                : course.MentorIds.Concat(new[] { userId, GlobalFilterId }).Concat(groupIds).ToArray();

            var courseFilters =
                (await _courseFilterRepository.GetAsync(findFiltersFor, course.Id))
                .ToDictionary(x => x.Id, x => x.CourseFilter);

            if (!isMentor)
            {
                var globalFilter = courseFilters.GetValueOrDefault(GlobalFilterId);
                var globalCourse = globalFilter != null
                    ? ApplyFilterInternal(course, course, globalFilter, ApplyFilterOperation.Subtract)
                    : course;

                var studentCourse = studentGroups
                    .Select(g => courseFilters.GetValueOrDefault(g.Id.ToString()))
                    .Where(cf => cf != null)
                    .Aggregate(globalCourse, (current, groupCourseFilter) =>
                        ApplyFilterInternal(course, current, groupCourseFilter, ApplyFilterOperation.Union));

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
                    MentorId = u.Id,
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

        public async Task UpdateGroupFilters(long courseId, long homeworkId, Group group)
        {
            var groupMates = (group?.GroupMates.ToArray() ?? Array.Empty<GroupMate>()).Select(gm => gm.StudentId).ToList();

            var existingFilters = (await _courseFilterRepository.GetAsync(new[] { GlobalFilterId, group.Id.ToString() }, courseId))
                .ToDictionary(x => x.Id, x => x.CourseFilter);

            await UpdateOrCreateFilter(GlobalFilterId, courseId, homeworkId, new List<string>(), existingFilters);
            await UpdateOrCreateFilter(group.Id.ToString(), courseId, homeworkId, groupMates, existingFilters);
        }

        private async Task UpdateOrCreateFilter(string id, long courseId, long homeworkId, List<string> studentIds,
            Dictionary<string, CourseFilter> existingFilters)
        {
            if (existingFilters.TryGetValue(id, out var courseFilter) && courseFilter.Filter is { } filter)
            {
                filter.StudentIds = studentIds;
                filter.HomeworkIds.Add(homeworkId);
                await UpdateAsync(courseFilter.Id, courseFilter.Filter);
            }
            else
            {
                var newFilter = new Filter
                {
                    StudentIds = studentIds,
                    HomeworkIds = new List<long> { homeworkId },
                    MentorIds = new List<string>()
                };
                await AddCourseFilter(newFilter, courseId, id);
            }
        }
    }
}
