using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;

namespace HwProj.CourseWorkService.API.Services
{
    public interface IWorkFilesService
    {
        Task<WorkFile> GetWorkFileAsync(long workFileId);
        Task<WorkFile[]> GetFilteredWorkFilesAsync(Expression<Func<WorkFile, bool>> predicate);

        Task<long> AddWorkFileAsync(WorkFile workFile);
        Task DeleteWorkFileAsync(long workFileId);
        Task UpdateWorkFileAsync(long workFileId, WorkFile workFile);
    }
}
