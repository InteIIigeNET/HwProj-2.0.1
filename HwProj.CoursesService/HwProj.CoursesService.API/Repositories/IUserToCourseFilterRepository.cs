using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IUserToCourseFilterRepository
    {
        Task<UserToCourseFilter> GetAsync(string userId, long courseId);
        Task AddAsync(UserToCourseFilter userToCourseFilter);
        Task UpdateAsync(UserToCourseFilter userToCourseFilter);
        Task DeleteAsync(string userId, long courseId);
    }
}