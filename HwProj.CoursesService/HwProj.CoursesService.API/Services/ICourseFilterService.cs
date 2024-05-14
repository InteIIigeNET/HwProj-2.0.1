using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Services
{
    public interface ICourseFilterService
    {
        Task<long> CreateOrUpdateExpertFilter(CreateCourseFilterViewModel courseFilterView);
        Task AddUserToCourseFilterRecords(CreateCourseFilterViewModel courseFilterView, long filterId);
        Task<Filter> GetUserCourseFilterAsync(string userId, long courseId);
        Task UpdateAsync(string userId, long courseId, Filter filter);
        Task UpdateAsync(long courseFilterId, Filter filter);
    }
}