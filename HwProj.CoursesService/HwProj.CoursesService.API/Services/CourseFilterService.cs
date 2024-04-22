using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;

namespace HwProj.CoursesService.API.Services
{
    public class CourseFilterService : ICourseFilterService
    {
        private readonly ICourseFilterRepository _courseFilterRepository;
        private readonly IUserToCourseFilterService _userToCourseFilterService;
        
        public async Task<Filter> GetUserCourseFilterAsync(string userId, long courseId)
        {
            var courseFilterId = await _userToCourseFilterService.GetCourseFilterIdAsync(userId, courseId);
            return (await _courseFilterRepository.GetAsync(courseFilterId)).Filter;
        }

        public async Task UpdateAsync(string userId, long courseId, Filter filter)
        {
            long courseFilterId = await _userToCourseFilterService.GetCourseFilterIdAsync(userId, courseId);
            await UpdateAsync(courseFilterId, filter);
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