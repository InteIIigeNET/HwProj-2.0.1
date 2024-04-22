using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Services
{
    public interface ICourseFilterService
    {
        Task<Filter> GetUserCourseFilterAsync(string userId, long courseId);
        Task UpdateAsync(string userId, long courseId, Filter filter);
        Task UpdateAsync(long courseFilterId, Filter filter);
    }
}