using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories.Interfaces
{
    public interface ICourseWorksRepository : ICrudRepository<CourseWork, long>
    {
        Task<CourseWork> GetCourseWorkAsync(long id);
        Task ClearIsUpdatedInCourseWorksByCuratorAsync(string userId);
    }
}
