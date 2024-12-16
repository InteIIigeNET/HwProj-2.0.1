using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICourseFilterRepository : ICrudRepository<CourseFilter, long>
    {
        Task<CourseFilter?> GetAsync(string userId, long courseId);
        Task<List<UserToCourseFilter>> GetAsync(string[] userIds, long courseId);
        Task<List<UserToCourseFilter>> GetAsync(string userId, long[] courseIds);
        Task<long> AddAsync(CourseFilter courseFilter, string userId, long courseId);
    }
}