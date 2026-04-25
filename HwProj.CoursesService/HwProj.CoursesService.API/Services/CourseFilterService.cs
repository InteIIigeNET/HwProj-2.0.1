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
        private const string StudentsGroupName = "";
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

            // Получаем группы пользователя из course
            var studentGroups = course.Groups
                .Where(g => g.StudentsIds.Contains(userId))
                .ToArray();
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
            var mentorsGroups = await _groupsService.GetGroupsAsync(usersCourseFilters.SelectMany(u => u.CourseFilter.Filter.GroupIds).ToArray());

            return usersCourseFilters
                .Where(u => u.CourseFilter.Filter.HomeworkIds.Count == 0)
                .Select(u => new MentorToAssignedStudentsDTO
                {
                    MentorId = u.Id,
                    SelectedStudentsIds = u.CourseFilter.Filter.StudentIds
                        .Concat(mentorsGroups
                            .Where(g => u.CourseFilter.Filter.GroupIds.Contains(g.Id))
                            .SelectMany(g => g.GroupMates.Select(gm => gm.StudentId)))
                        .ToList()
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

            var groups = filter.GroupIds.Any()
                ? editingCourseDto.Groups.Where(g => filter.GroupIds.Contains(g.Id)).ToArray()
                : Array.Empty<GroupViewModel>();

            var filteredStudentIds = groups
                .SelectMany(g => g.StudentsIds)
                .Concat(filter.StudentIds)
                .ToHashSet();

            return new CourseDTO
            {
                Id = editingCourseDto.Id,
                Name = editingCourseDto.Name,
                GroupName = editingCourseDto.GroupName,
                IsCompleted = editingCourseDto.IsCompleted,
                IsOpen = editingCourseDto.IsOpen,
                InviteCode = editingCourseDto.InviteCode,
                Groups = groups.Concat(
                    editingCourseDto.Groups
                        .Where(gs => gs.Name == StudentsGroupName)
                        .Select(gs =>
                        {
                            var groupStudentsIds = gs.StudentsIds.Intersect(filteredStudentIds).ToArray();
                            return groupStudentsIds.Any()
                                ? new GroupViewModel
                                {
                                    Id = gs.Id,
                                    Name = gs.Name,
                                    StudentsIds = groupStudentsIds
                                }
                                : null;
                        })
                        .Where(t => t != null))
                    .ToArray(),
                MentorIds = filter.MentorIds.Any()
                    ? editingCourseDto.MentorIds.Intersect(filter.MentorIds).ToArray()
                    : editingCourseDto.MentorIds,
                CourseMates = editingCourseDto.CourseMates
                    .Where(mate => !mate.IsAccepted || filteredStudentIds.Contains(mate.StudentId)).ToArray(),
                Homeworks = homeworks.OrderBy(hw => hw.PublicationDate).ToArray()
            };
        }

        public async Task UpdateGroupFilters(long courseId, long homeworkId, Group group)
        {
            var filterIds = group != null
                ? new[] { GlobalFilterId, group.Id.ToString() }
                : new[] { GlobalFilterId };

            var filters = await _courseFilterRepository.GetAsync(filterIds, courseId);

            foreach (var filterId in filterIds)
            {
                var existingCourseFilter = filters.SingleOrDefault(f => f.Id == filterId)?.CourseFilter;
                var newFilter = existingCourseFilter?.Filter
                    ?? new Filter { GroupIds = new List<long>(), StudentIds = new List<string>(),
                        HomeworkIds = new List<long>(), MentorIds = new List<string>() };
                newFilter.HomeworkIds.Add(homeworkId);

                if (existingCourseFilter != null)
                    await UpdateAsync(existingCourseFilter.Id, newFilter);
                else
                    await AddCourseFilter(newFilter, courseId, filterId);
            }
        }
    }
}
