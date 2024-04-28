using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;

namespace HwProj.CoursesService.API.Services
{
    public class CourseFilterService : ICourseFilterService
    {
        private readonly ICourseFilterRepository _courseFilterRepository;
        private readonly IUserToCourseFilterRepository _userToCourseFilterRepository;
        
        public async Task<Filter> GetUserCourseFilterAsync(string userId, long courseId)
        {
            var courseFilter = await _userToCourseFilterRepository.GetAsync(userId, courseId);
            return (await _courseFilterRepository.GetAsync(courseFilter.CourseFilterId)).Filter;
        }

        public async Task UpdateAsync(string userId, long courseId, Filter filter)
        {
            var courseFilter = await _userToCourseFilterRepository.GetAsync(userId, courseId);
            await UpdateAsync(courseFilter.CourseFilterId, filter);
        }

        public async Task UpdateAsync(long courseFilterId, Filter filter)
        {
            await _courseFilterRepository.UpdateAsync(courseFilterId, f =>
                new CourseFilter
                {
                    Filter = filter
                });
        }
    }
}