using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Exceptions;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services.Implementations
{
    #region Class: ApplicationService

    public class ApplicationService : IApplicationsService
    {
        #region Fields: Private

        private readonly IViewModelService _viewModelService;
        private readonly IApplicationsRepository _applicationsRepository;
        private readonly ICourseWorksRepository _courseWorksRepository;
        private readonly IUsersRepository _usersRepository;

        #endregion

        #region Constructors: Public

        public ApplicationService(IApplicationsRepository applicationsRepository, ICourseWorksRepository courseWorksRepository,
            IUsersRepository usersRepository, IViewModelService viewModelService)
        {
            _applicationsRepository = applicationsRepository;
            _courseWorksRepository = courseWorksRepository;
            _usersRepository = usersRepository;
            _viewModelService = viewModelService;
        }

        #endregion

        #region Methods: Private

        private async Task<Application> GetApplicationByIdAsync(long appId)
        {
	        var application = await _applicationsRepository.GetApplicationAsync(appId).ConfigureAwait(false);
	        return application ?? throw new ObjectNotFoundException($"Course work with id {appId}");
        }

        [SuppressMessage("ReSharper", "ParameterOnlyUsedForPreconditionCheck.Local")]
        private static void CheckApplicationStudent(Application application, string userId)
        {
            if (application.StudentProfileId != userId) throw new ForbidException("Not enough rights");
        }

        [SuppressMessage("ReSharper", "ParameterOnlyUsedForPreconditionCheck.Local")]
        private static void CheckApplicationLecturer(Application application, string userId)
        {
            if (application.CourseWork.LecturerProfileId != userId) throw new ForbidException("Not enough rights");
        }

        [SuppressMessage("ReSharper", "ParameterOnlyUsedForPreconditionCheck.Local")]
        private static void CheckStudentNotExist(Application application)
        {
            if (application.CourseWork.StudentProfileId != null) throw  new BadRequestException("Student already exist");
        }

        private async Task AssignCuratorToCourseWork(CourseWork courseWork, long? directionId)
        {
            var lecturer = await _usersRepository.GetUserAsync(courseWork.LecturerProfileId).ConfigureAwait(false);
            var curators = await _usersRepository.GetUsersByRoleAsync(Roles.Curator).ConfigureAwait(false);
            curators = curators.Where(c => c.CuratorProfile.DepartmentId == lecturer.LecturerProfile.DepartmentId).ToArray();
            if (curators.Length == 1)
            {
                await _courseWorksRepository.UpdateAsync(courseWork.Id, cw => new CourseWork()
                {
                    CuratorProfileId = curators[0].Id
                }).ConfigureAwait(false);
                return;
            }

            if (directionId != null && curators.Count(c
                => c.CuratorProfile.Directions.Select(d => d.Id).ToList().Contains((long) directionId)) == 1)
            {
                await _courseWorksRepository.UpdateAsync(courseWork.Id, cw => new CourseWork()
                {
                    CuratorProfileId = curators.First(c
                        => c.CuratorProfile.Directions.Select(d => d.Id).ToList().Contains((long)directionId)).Id
                }).ConfigureAwait(false);
            }
        }

        #endregion

        #region Methods: Public

        public async Task<long> AddApplicationAsync(string userId, long courseWorkId,
            CreateApplicationViewModel createApplicationViewModel)
        {
            var application = _viewModelService.GetApplicationFromViewModel(userId, courseWorkId, createApplicationViewModel);
            return await _applicationsRepository.AddAsync(application).ConfigureAwait(false);
        }

        public async Task<OverviewApplicationDTO[]> GetFilteredApplicationsAsync(Expression<Func<Application, bool>> predicate)
        {
            var applications = await _applicationsRepository
                .FindAll(predicate)
                .Include(a => a.CourseWork)
                .Include(a => a.StudentProfile)
                .ThenInclude(sp => sp.User)
                .ToArrayAsync().ConfigureAwait(false);
            var overviewApplications = new List<OverviewApplicationDTO>();
            foreach (var app in applications)
            {
                overviewApplications.Add(_viewModelService.GetOverviewApplicationDTO(app));
            }

            return overviewApplications.ToArray();
        }

        public async Task<StudentApplicationDTO> GetApplicationForStudentAsync(string userId, long appId)
        {
            var application = await GetApplicationByIdAsync(appId);
            CheckApplicationStudent(application, userId);

            return _viewModelService.GetStudentApplicationDTO(application);
        }

        public async Task<LecturerApplicationDTO> GetApplicationForLecturerAsync(string userId, long appId)
        {
            var application = await GetApplicationByIdAsync(appId);
            CheckApplicationLecturer(application, userId);

            return _viewModelService.GetLecturerApplicationDTO(application);
        }

        public async Task CancelApplicationAsync(string userId, long appId)
        {
            var application = await GetApplicationByIdAsync(appId).ConfigureAwait(false);
            CheckApplicationStudent(application, userId);
            await _applicationsRepository.DeleteAsync(appId).ConfigureAwait(false);
        }

        public async Task RejectApplicationAsync(string userId, long appId)
        {
            var application = await GetApplicationByIdAsync(appId).ConfigureAwait(false);
            CheckApplicationLecturer(application, userId);
            await _applicationsRepository.DeleteAsync(appId).ConfigureAwait(false);
        }

        public async Task AcceptStudentApplicationAsync(string userId, long appId)
        {
            var application = await GetApplicationByIdAsync(appId).ConfigureAwait(false);
            CheckApplicationLecturer(application, userId);
            CheckStudentNotExist(application);

            await _courseWorksRepository.UpdateAsync(application.CourseWorkId, cw => new CourseWork()
            {
                StudentProfileId = application.StudentProfileId
            }).ConfigureAwait(false);

            foreach (var app in application.CourseWork.Applications)
            {
                await _applicationsRepository.DeleteAsync(app.Id).ConfigureAwait(false);
            }

            foreach (var app in application.StudentProfile.Applications)
            {
                await _applicationsRepository.DeleteAsync(app.Id).ConfigureAwait(false);
            }

            await AssignCuratorToCourseWork(application.CourseWork, application.StudentProfile.DirectionId).ConfigureAwait(false);
        }

        #endregion
    }

    #endregion
}
