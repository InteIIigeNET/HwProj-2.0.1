using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;

namespace HwProj.CoursesService.API.Services
{
    public class CourseFilterService : ICourseFilterService
    {
        private readonly ICourseFilterRepository _courseFilterRepository;

        public CourseFilterService(
            ICourseFilterRepository courseFilterRepository)
        {
            _courseFilterRepository = courseFilterRepository;
        }
        
        public async Task<Result<long>> CreateOrUpdateExpertFilter(CreateCourseFilterModel courseFilterModel)
        {
            var areViewInvalid = courseFilterModel.IsFilterParametersEmpty();
            if (areViewInvalid)
            {
                return Result<long>.Failed("Необходимо выделить эксперту хотя бы одного студента и домашнюю работу");
            }

            var filter = CourseFilterUtils.CreateFilter(courseFilterModel);
            
            var existingCourseFilter = await _courseFilterRepository.GetAsync(courseFilterModel.UserId, courseFilterModel.CourseId);
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
            var tasks = courses
                .Select(course => ApplyFilter(course, userId))
                .ToArray();

            return await Task.WhenAll(tasks);
        }

        public async Task<CourseDTO> ApplyFilter(CourseDTO courseDto, string userId)
        {
            var courseFilter = await _courseFilterRepository.GetAsync(userId, courseDto.Id);
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
                    courseDto.Groups.Where(gs => gs.StudentsIds.Intersect(filter.StudentIds).Any())
                        .Select(gs => new GroupViewModel
                        {
                            Id = gs.Id,
                            StudentsIds = gs.StudentsIds.Intersect(filter.StudentIds).ToArray()
                        })
                        .ToArray(),
                MentorIds = !filter.MentorIds.Any()
                    ? courseDto.MentorIds
                    : courseDto.MentorIds.Intersect(filter.MentorIds).ToArray(),
                CourseMates =
                    courseDto.CourseMates.Where(mate => filter.StudentIds.Contains(mate.StudentId)).ToArray(),
                Homeworks =
                    courseDto.Homeworks.Where(hw => filter.HomeworkIds.Contains(hw.Id)).ToArray()
            };
        }

        private async Task<long> AddCourseFilter(Filter filter, long courseId, string userId)
        {
            var courseFilterId =
                await _courseFilterRepository.AddAsync(new CourseFilter { Filter = filter }, userId, courseId);
            return courseFilterId;
        }
    }
}