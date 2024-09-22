using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICourseFilterRepository : ICrudRepository<CourseFilter, long>
    {
        Task<CourseFilter?> GetAsync(string userId, long courseId);
        
        Task<long> AddAsync(CourseFilter courseFilter, string userId, long courseId);
    }
}