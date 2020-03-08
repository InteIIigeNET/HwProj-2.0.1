using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public class ApplicationService : IApplicationService
    {
        private readonly IApplicationsRepository _applicationRepository;
        private readonly ICourseWorksRepository _courseWorkRepository;

        public ApplicationService(IApplicationsRepository applicationRepository, ICourseWorksRepository courseWorkRepository)
        {
            _applicationRepository = applicationRepository;
            _courseWorkRepository = courseWorkRepository;
    }

        public async Task<Application[]> GetAllApplicationsAsync()
        {
            return await _applicationRepository.GetAll().ToArrayAsync();
        }

        public async Task<Application[]> GetFilteredApplicationsAsync(Expression<Func<Application, bool>> predicate)
        {
            return await _applicationRepository.FindAll(predicate).ToArrayAsync();
        }

        public async Task<Application[]> GetLecturerApplicationsAsync(long lecturerId)
        {
            var courseWorks = await _courseWorkRepository
                .FindAll(a => a.LecturerId == lecturerId)
                .ToArrayAsync().ConfigureAwait(false);
            var applications = new List<Application>();

            foreach (var course in courseWorks)
            {
                var apps = await _applicationRepository
                    .FindAll(a => a.CourseWorkId == course.Id)
                    .ToArrayAsync().ConfigureAwait(false);
                applications.AddRange(apps);
            }

            return applications.ToArray();
        }

        public async Task<Application> GetApplicationAsync(long applicationId) 
        {
            return await _applicationRepository.GetAsync(applicationId);
        }

        public async Task<long> AddApplicationAsync(Application application)
        {
            return await _applicationRepository.AddAsync(application);
        }

        public async Task DeleteApplicationAsync(long studentId, long courseWorkId)
        {
            var application = await _applicationRepository
                .FindAsync(app => app.CourseWorkId == courseWorkId && app.StudentId == studentId);
            await _applicationRepository.DeleteAsync(application.Id);
        }
    }
}
