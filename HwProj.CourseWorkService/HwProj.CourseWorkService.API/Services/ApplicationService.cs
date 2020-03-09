using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public class ApplicationService : EntityService<Application> , IApplicationService
    {
        private readonly IApplicationsRepository _applicationRepository;
        private readonly ICourseWorksRepository _courseWorkRepository;

        public ApplicationService(IApplicationsRepository applicationRepository, ICourseWorksRepository courseWorkRepository)
        : base(applicationRepository)
        {
            _applicationRepository = applicationRepository;
            _courseWorkRepository = courseWorkRepository;
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

        public async Task DeleteApplicationAsync(long studentId, long courseWorkId)
        {
            var application = await _applicationRepository
                .FindAsync(app => app.CourseWorkId == courseWorkId && app.StudentId == studentId);
            await _applicationRepository.DeleteAsync(application.Id);
        }
    }
}
