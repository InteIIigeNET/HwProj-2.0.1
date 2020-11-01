using System;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;

namespace HwProj.CourseWorkService.API.Services.Interfaces
{
    public interface ICourseWorksService
    {
        Task<OverviewCourseWorkDTO[]> GetFilteredCourseWorksAsync(Func<CourseWork, bool> predicate);
        Task<DetailCourseWorkDTO> GetCourseWorkInfoAsync(long courseWorkId);
        Task<long> AddCourseWorkAsync(CreateCourseWorkViewModel courseWorkViewModel, string userId, bool createdByCurator);
        Task DeleteCourseWorkAsync(long courseWorkId, string userId);
        Task UpdateCourseWorkAsync(long courseWorkId, string userId,
            CreateCourseWorkViewModel createCourseWorkViewModel);
        DeadlineDTO[] GetCourseWorkDeadlines(string userId, CourseWork courseWork);
        Task<long> AddDeadlineAsync(AddDeadlineViewModel newDeadline, CourseWork courseWork);
        WorkFileDTO[] GetWorkFilesDTO(WorkFile[] workFiles);
    }
}
