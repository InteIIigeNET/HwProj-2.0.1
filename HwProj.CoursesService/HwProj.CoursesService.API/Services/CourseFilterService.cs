using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using System;
using HwProj.CoursesService.API.Domains;

namespace HwProj.CoursesService.API.Services
{
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

            return courses
                .Select(course =>
                {
                    filters.TryGetValue(course.Id, out var courseFilter);
                    return ApplyFilterInternal(course, courseFilter);
                })
                .ToArray();
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

            // Применение глобального фильтра для вычитания групповых домашних заданий
            if (isCourseStudent)
            {
                var studentCourse = courseDto;
                var groupFilter = await _courseFilterRepository.GetAsync("", courseDto.Id);
                if (groupFilter != null)
                {
                    studentCourse = ApplyFilterSubtractive(courseDto, groupFilter);
                }
                return courseFilters.TryGetValue(userId, out var studentFilter)
                        ? await ApplyFilterAdditive(studentCourse, studentFilter)
                        : studentCourse;
            }

            var course = courseFilters.TryGetValue(userId, out var userFilter)
                ? ApplyFilterInternal(courseDto, userFilter)
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

        private CourseDTO ApplyFilterInternal(CourseDTO courseDto, CourseFilter? courseFilter)
        {
            var filter = courseFilter?.Filter;

            if (filter == null)
            {
                return courseDto;
            }

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
                Homeworks =
                    filter.HomeworkIds.Any()
                        ? courseDto.Homeworks.Where(hw => filter.HomeworkIds.Contains(hw.Id)).ToArray()
                        : courseDto.Homeworks
            };
        }

        private CourseDTO ApplyFilterSubtractive(CourseDTO courseDto, CourseFilter? courseFilter)
        {
            var filter = courseFilter?.Filter;

            if (filter == null)
            {
                return courseDto;
            }

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
                                var filteredStudentsIds = gs.StudentsIds.Except(filter.StudentIds).ToArray();
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
                    ? courseDto.MentorIds.Except(filter.MentorIds).ToArray()
                    : courseDto.MentorIds,
                CourseMates =
                    filter.StudentIds.Any()
                        ? courseDto.CourseMates
                            .Where(mate => !mate.IsAccepted || !filter.StudentIds.Contains(mate.StudentId)).ToArray()
                        : courseDto.CourseMates,
                Homeworks =
                    filter.HomeworkIds.Any()
                        ? courseDto.Homeworks.Where(hw => !filter.HomeworkIds.Contains(hw.Id)).ToArray()
                        : courseDto.Homeworks
            };
        }

        private async Task<CourseDTO> ApplyFilterAdditive(CourseDTO courseDto, CourseFilter? courseFilter)
        {
            var filter = courseFilter?.Filter;

            if (filter == null)
            {
                return courseDto;
            }

            var additionalHomeworks = filter.HomeworkIds.Any()
                ? (await Task.WhenAll(filter.HomeworkIds.Select(id => _homeworksService.GetHomeworkAsync(id))))
                    .Where(hw => hw != null)
                    .Select(hw => hw.ToHomeworkViewModel())
                    .ToArray()
                : Array.Empty<HomeworkViewModel>();

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
                                var filteredStudentsIds = gs.StudentsIds.Union(filter.StudentIds).ToArray();
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
                    ? courseDto.MentorIds.Union(filter.MentorIds).ToArray()
                    : courseDto.MentorIds,
                CourseMates = courseDto.CourseMates,
                Homeworks = courseDto.Homeworks.Union(additionalHomeworks).ToArray()
            };
        }
    }
}
