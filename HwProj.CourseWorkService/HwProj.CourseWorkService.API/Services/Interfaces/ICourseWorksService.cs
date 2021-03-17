using System;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using Microsoft.AspNetCore.Http;

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
        Task<long> ApplyToCourseWorkAsync(string userId, long courseWorkId,
            CreateApplicationViewModel createApplicationViewModel);
        Task ExcludeStudentAsync(string userId, long courseWorkId);
        Task UpdateReferenceInCourseWorkAsync(string userId, long courseWorkId, string reference = null, bool remove = false);
        Task<long> AddWorkFileToCourseWorkAsync(string userId, long courseWorkId, FileTypes fileType, IFormFile file);
        Task RemoveWorkFileAsync(string userId, long courseWorkId, long fileId);
        Task<WorkFile> GetWorkFileAsync(long courseWorkId, long fileId);
        Task<WorkFileDTO[]> GetCourseWorkFilesAsync(long courseWorkId);
        Task SetIsUpdatedInCourseWork(long courseWorkId, bool value = false);
    }
}
