using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;

namespace HwProj.CoursesService.API.Services
{
    public class UserToCourseFilterService : IUserToCourseFilterService
    {
        private readonly IUserToCourseFilterRepository _userToCourseFilterRepository;
        
        public async Task<long> GetCourseFilterIdAsync(string userId, long courseId)
        {
            return (await _userToCourseFilterRepository.GetAsync(userId, courseId)).CourseFilterId;
        }

        public async Task UpdateAsync(UserToCourseFilter userToCourseFilter)
        {
            await _userToCourseFilterRepository.UpdateAsync(userToCourseFilter);
        }

        public async Task DeleteAsync(string userId, long courseId)
        {
            await _userToCourseFilterRepository.DeleteAsync(userId, courseId);
        }
    }
}