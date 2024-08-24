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
        Task UpdateAsync(long courseFilterId, Filter filter);
        Task<CourseDTO[]> ApplyFiltersToCourses(string userId, CourseDTO[] courses);
        Task<CourseDTO> ApplyFilter(CourseDTO courseDto, string userId);
    }
}