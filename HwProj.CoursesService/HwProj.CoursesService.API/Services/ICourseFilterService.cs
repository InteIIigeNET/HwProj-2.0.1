using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;

namespace HwProj.CoursesService.API.Services
{
    public interface ICourseFilterService
    {
        Task<Result<long>> CreateOrUpdateExpertFilter(CreateCourseFilterModel courseFilterModel);
        Task AddUserToCourseFilterRecords(CreateCourseFilterModel courseFilterModel, long filterId);
        Task<Filter?> GetUserFilterAsync(string userId, long courseId);
        Task UpdateAsync(string userId, long courseId, Filter filter);
        Task UpdateAsync(long courseFilterId, Filter filter);
        IQueryable<long> GetExpertCourseIds(string userId);
        CourseDTO[] FilterCourses(string userId, CourseDTO[] courses);
    }
}