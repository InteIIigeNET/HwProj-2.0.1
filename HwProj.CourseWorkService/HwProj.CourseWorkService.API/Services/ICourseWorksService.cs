using System;
using System.Linq.Expressions;
using HwProj.CourseWorkService.API.Models;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models.DTO;

namespace HwProj.CourseWorkService.API.Services
{
    public interface ICourseWorksService
    {
        Task<OverviewCourseWorkDTO[]> GetFilteredCourseWorksWithStatus(string status, Func<CourseWork, bool> predicate);
        Task<OverviewCourseWorkDTO[]> GetActiveFilteredCourseWorks(Func<CourseWork, bool> predicate);
        Task<OverviewCourseWorkDTO[]> GetCompletedFilteredCourseWorks(Func<CourseWork, bool> predicate);
        DetailCourseWorkDTO GetCourseWorkInfo(CourseWork courseWork);
        DeadlineDTO[] GetCourseWorkDeadlines(string userId, CourseWork courseWork);
    }
}
