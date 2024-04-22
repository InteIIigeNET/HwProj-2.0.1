using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Services
{
    public interface IUserToCourseFilterService
    {
        Task<long> GetCourseFilterIdAsync(string userId, long courseId);
        Task UpdateAsync(UserToCourseFilter userToCourseFilter);
        Task DeleteAsync(string userId, long courseId);
    }
}