using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public class ApplicationService : IApplicationService
    {
        private readonly IApplicationsRepository _applicationRepository;
        private readonly ICourseWorkService _courseWorkService;

        public ApplicationService(IApplicationsRepository applicationRepository, ICourseWorkService courseWorkService)
        {
            _applicationRepository = applicationRepository;
            _courseWorkService = courseWorkService;
    }

        public async Task<Application[]> GetAllApplicationsAsync()
        {
            return await _applicationRepository.GetAll().ToArrayAsync();
        }

        public async Task<Application> GetApplicationAsync(long applicationId) 
        {
            return await _applicationRepository.GetAsync(applicationId);
        }

        public async Task<Application[]> GetAllStudentApplicationsAsync(string studentId)
        {
            return await _applicationRepository
                .FindAll(application => application.StudentId == studentId).ToArrayAsync();
        }

        public async Task<long> AddApplicationAsync(Application application, string studentId, long courseWorkId)
        {
            application.DateOfApplication = DateTime.Now;
            application.StudentId = studentId;
            application.CourseWorkId = courseWorkId;
            return await _applicationRepository.AddAsync(application);
        }

        public async Task<Application[]> GetAllSupervisorApplicationsAsync(string supervisorId)
        {
            var courseWorks = await _courseWorkService
                .GetFilteredCourseWorksAsync(new Filter() { IsAvailable = true, SupervisorId = supervisorId });
            var allSupervisorApplications = new List<Application>();
            foreach (var courseWork in courseWorks)
            {
                var applications = _applicationRepository.FindAll(application => application.CourseWorkId == courseWork.Id);
                foreach(var application in applications)
                {
                    allSupervisorApplications.Add(application);
                }
            }
            return allSupervisorApplications.ToArray();
        }

        public async Task<Application[]> GetAllCourseWorkApplicationsAsync(long courseWorkId)
        {
            var courseWork = _courseWorkService.GetCourseWorkAsync(courseWorkId);
            return await _applicationRepository
                .FindAll(application => application.CourseWorkId == courseWork.Id)
                .ToArrayAsync();
        }

        public async Task DeleteApplicationAsync(string studentId, long courseWorkId)
        {
            var application = await _applicationRepository
                .FindAsync(app => app.CourseWorkId == courseWorkId && app.StudentId == studentId);
            await _applicationRepository.DeleteAsync(application.Id);
        }
    }
}
