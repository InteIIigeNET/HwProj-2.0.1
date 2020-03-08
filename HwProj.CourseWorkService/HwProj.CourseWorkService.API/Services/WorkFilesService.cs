using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services
{
    public class WorkFilesService : IWorkFilesService
    {
        private readonly IWorkFilesRepository _workFilesRepository;

        public WorkFilesService(IWorkFilesRepository workFilesRepository)
        {
            _workFilesRepository = workFilesRepository;
        }

        public async Task<WorkFile> GetWorkFileAsync(long workFileId)
        {
            return await _workFilesRepository.GetAsync(workFileId);
        }

        public async Task<WorkFile[]> GetFilteredWorkFilesAsync(Expression<Func<WorkFile, bool>> predicate)
        {
            return await _workFilesRepository.FindAll(predicate).ToArrayAsync();
        }

        public async Task<long> AddWorkFileAsync(WorkFile workFile)
        {
            return await _workFilesRepository.AddAsync(workFile);
        }

        public async Task DeleteWorkFileAsync(long workFileId)
        {
            await _workFilesRepository.DeleteAsync(workFileId);
        }

        public async Task UpdateWorkFileAsync(long workFileId, WorkFile workFile)
        {
            var newWorkFile = await GetWorkFileAsync(workFileId).ConfigureAwait(false);
            newWorkFile.IsFile = workFile.IsFile;
            newWorkFile.ReferenceOnFile = workFile.ReferenceOnFile;
            newWorkFile.FileName = workFile.FileName;
            newWorkFile.FileType = workFile.FileType;
            newWorkFile.Data = workFile.Data;
            await _workFilesRepository.UpdateAsync(workFileId, wf => newWorkFile);
        }
    }
}
