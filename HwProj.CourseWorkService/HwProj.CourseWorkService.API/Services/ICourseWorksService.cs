using System;
using HwProj.CourseWorkService.API.Models;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models.DTO;

namespace HwProj.CourseWorkService.API.Services
{
    public interface ICourseWorksService
    {
        Task<OverviewCourseWorkDTO[]> GetFilteredCourseWorksWithStatusAsync(string status, Func<CourseWork, bool> predicate);
        Task<OverviewCourseWorkDTO[]> GetActiveFilteredCourseWorksAsync(Func<CourseWork, bool> predicate);
        Task<OverviewCourseWorkDTO[]> GetCompletedFilteredCourseWorksAsync(Func<CourseWork, bool> predicate);
        DetailCourseWorkDTO GetCourseWorkInfo(CourseWork courseWork);
        DeadlineDTO[] GetCourseWorkDeadlines(string userId, CourseWork courseWork);
    }
}
