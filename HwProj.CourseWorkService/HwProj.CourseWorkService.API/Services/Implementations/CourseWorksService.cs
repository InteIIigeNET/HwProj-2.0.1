using System;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Exceptions;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services.Implementations
{
    public class CourseWorksService : ICourseWorksService
    {
        #region Fields: Private

        private readonly IApplicationsService _applicationsService;
        private readonly IViewModelService _viewModelService;
        private readonly ICourseWorksRepository _courseWorksRepository;
        private readonly IWorkFilesRepository _workFilesRepository;

        #endregion

        #region Constructors: Public

        public CourseWorksService(IApplicationsService applicationsService, ICourseWorksRepository courseWorkRepository,
            IViewModelService viewModelService, IWorkFilesRepository workFilesRepository)
        {
            _applicationsService = applicationsService;
            _courseWorksRepository = courseWorkRepository;
            _viewModelService = viewModelService;
            _workFilesRepository = workFilesRepository;
        }

        #endregion

        #region Methods: Private

        private async Task<CourseWork> GetCourseWorkByIdAsync(long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            return courseWork ??
                   throw new ObjectNotFoundException($"Course work with id {courseWorkId}");
        }

        [SuppressMessage("ReSharper", "ParameterOnlyUsedForPreconditionCheck.Local")]
        private static void CheckCourseWorkLecturer(CourseWork courseWork, string userId)
        {
            if (courseWork.LecturerProfileId != userId) throw new ForbidException("Only an owner of the course work have rights to this action!");
        }

        [SuppressMessage("ReSharper", "ParameterOnlyUsedForPreconditionCheck.Local")]
        private static void CheckCourseWorkLecturerOrStudent(CourseWork courseWork, string userId)
        {
            if (courseWork.StudentProfileId != userId && courseWork.LecturerProfileId != userId) 
	            throw new ForbidException("Only a student and lecturer ot the course work have rights to this action!");
        }

        #endregion

        #region Methods: Public

        public async Task<OverviewCourseWorkDTO[]> GetFilteredCourseWorksAsync(Func<CourseWork, bool> predicate)
        {
            var courseWorks = await _courseWorksRepository
                .FindAll(courseWork => predicate(courseWork))
                .ToArrayAsync()
                .ConfigureAwait(false);

            return await Task.WhenAll(courseWorks
                .Select(async courseWork => await _viewModelService.GetCourseWorkOverviewDTO(courseWork).ConfigureAwait(false))
                .ToArray());
        }

        public async Task<DetailCourseWorkDTO> GetCourseWorkInfoAsync(long courseWorkId)
        {
            var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
            return await _viewModelService.GetCourseWorkDetailDTO(courseWork).ConfigureAwait(false);
        }

        public async Task<long> AddCourseWorkAsync(CreateCourseWorkViewModel createCourseWorkViewModel, 
            string userId, bool createdByCurator)
        {
            var courseWork = await _viewModelService.GetCourseWorkFromViewModel(createCourseWorkViewModel, userId, createdByCurator)
                .ConfigureAwait(false);
            return await _courseWorksRepository.AddAsync(courseWork).ConfigureAwait(false);
        }

        public async Task DeleteCourseWorkAsync(long courseWorkId, string userId)
        {
            var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
            CheckCourseWorkLecturer(courseWork, userId);

            await _courseWorksRepository.DeleteAsync(courseWorkId).ConfigureAwait(false);
        }

        public async Task UpdateCourseWorkAsync(long courseWorkId, string userId,
            CreateCourseWorkViewModel createCourseWorkViewModel)
        {
            var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
            CheckCourseWorkLecturer(courseWork, userId);

            await _courseWorksRepository.UpdateAsync(courseWorkId, cw => new CourseWork()
                {
                    Title = createCourseWorkViewModel.Title,
                    Overview = createCourseWorkViewModel.Overview,
                    Description = createCourseWorkViewModel.Description,
                    Type = createCourseWorkViewModel.Type,
                    Requirements = createCourseWorkViewModel.Requirements,
                    ConsultantName = createCourseWorkViewModel.ConsultantName,
                    ConsultantContact = createCourseWorkViewModel.ConsultantContact,
                    SupervisorContact = createCourseWorkViewModel.SupervisorContact
                })
                .ConfigureAwait(false);
        }

        public async Task<long> ApplyToCourseWorkAsync(string userId, long courseWorkId, 
            CreateApplicationViewModel createApplicationViewModel)
        {
            var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
            if (courseWork.Applications.Count(app => app.StudentProfileId == userId) > 0)
            {
                throw new BadRequestException("Student already applied to course work!");
            }

            return await _applicationsService.AddApplicationAsync(userId, courseWorkId, createApplicationViewModel);
        }

        public async Task ExcludeStudentAsync(string userId, long courseWorkId)
        {
            var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
            CheckCourseWorkLecturer(courseWork, userId);

            await _courseWorksRepository.UpdateAsync(courseWork.Id, cw => new CourseWork()
            {
                CuratorProfileId = null,
                StudentProfileId = null
            }).ConfigureAwait(false);
        }

        public async Task UpdateReferenceInCourseWorkAsync(string userId, long courseWorkId, string reference = null, bool remove = false)
        {
	        var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
            CheckCourseWorkLecturerOrStudent(courseWork, userId);

	        await _courseWorksRepository.UpdateAsync(courseWorkId,
		        x => new CourseWork()
		        {
			        Reference = remove ? null : reference
		        }).ConfigureAwait(false);
        }

        public async Task<long> AddWorkFileToCourseWorkAsync(string userId, long courseWorkId, FileTypes fileType, IFormFile file)
        {
	        var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
	        if (fileType != FileTypes.Review)
	        {
                CheckCourseWorkLecturerOrStudent(courseWork, userId);
	        }
	        else if (courseWork.ReviewerProfileId != userId)
	        {
		        throw new ForbidException("Only a reviewer of the course work have rights to this action!");
	        }

	        if (fileType != FileTypes.Other)
	        {
		        var existWorkFile = courseWork.WorkFiles.FirstOrDefault(wf => wf.FileTypeId == (long) fileType);
		        if (existWorkFile != null)
		        {
			        await RemoveWorkFileAsync(userId, courseWorkId, existWorkFile.Id).ConfigureAwait(false);
		        }
	        }

	        var workFile = new WorkFile
	        {
		        FileName = file.FileName,
		        ContentType = file.ContentType,
		        CourseWork = courseWork,
		        FileTypeId = (long)fileType
	        };

	        using (var binaryReader = new BinaryReader(file.OpenReadStream()))
	        {
		        workFile.Data = binaryReader.ReadBytes((int)file.Length);
	        }

	        var id = await _workFilesRepository.AddAsync(workFile).ConfigureAwait(false);
	        if (fileType == FileTypes.CourseWorkText)
	        {
		        await SetIsUpdatedInCourseWork(courseWorkId, true).ConfigureAwait(false);
	        }
	        return id;
        }

        public async Task RemoveWorkFileAsync(string userId, long courseWorkId, long fileId)
        {
	        var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
	        var workFile = courseWork.WorkFiles.FirstOrDefault(wf => wf.Id == fileId);
	        if (workFile == null)
	        {
                throw new ObjectNotFoundException($"File with Id {fileId}");
	        }

	        if (workFile.FileTypeId != (long)FileTypes.Review)
	        {
		        CheckCourseWorkLecturerOrStudent(courseWork, userId);
	        }
	        else if (courseWork.ReviewerProfileId != userId)
	        {
		        throw new ForbidException("Only a reviewer of the course work have rights to this action!");
	        }

            await _workFilesRepository.DeleteAsync(workFile.Id).ConfigureAwait(false);
        }

        public async Task<WorkFile> GetWorkFileAsync(long courseWorkId, long fileId)
        {
	        var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
	        var workFile = courseWork.WorkFiles.FirstOrDefault(wf => wf.Id == fileId);
	        if (workFile == null)
	        {
		        throw new ObjectNotFoundException($"File with Id {fileId}");
	        }

	        return workFile;
        }

        public async Task<WorkFileDTO[]> GetCourseWorkFilesAsync(long courseWorkId)
        {
	        var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
	        var workFilesDTO = courseWork.WorkFiles.Select(_viewModelService.GetWorkFileDTO);
	        return workFilesDTO.ToArray();
        }

        public async Task SetIsUpdatedInCourseWork(long courseWorkId, bool value = false)
        {
	        await _courseWorksRepository.UpdateAsync(courseWorkId, cw => new CourseWork()
	        {
		        IsUpdated = value
	        }).ConfigureAwait(false);
        }

        #endregion
    }
}
