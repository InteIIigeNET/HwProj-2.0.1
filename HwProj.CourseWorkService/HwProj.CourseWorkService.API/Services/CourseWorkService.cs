using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public class CourseWorkService : ICourseWorkService
    {
        private readonly ICourseWorksRepository _courseWorkRepository;       
        private readonly IApplicationService _applicationService;

        public CourseWorkService(ICourseWorksRepository courseWorkRepository, IApplicationService applicationService)
        {
            _courseWorkRepository = courseWorkRepository;
            _applicationService = applicationService;
        }

        public async Task<CourseWork> GetCourseWorkAsync(long courseWorkId)
        {
            return await _courseWorkRepository.GetAsync(courseWorkId);
        }

        public async Task<CourseWork> GetStudentCourseWorkAsync(long studentId)
        {
            return await _courseWorkRepository.FindAsync(cw => cw.StudentId == studentId);
        }

        public async Task<CourseWork[]> GetFilteredCourseWorksAsync(Expression<Func<CourseWork, bool>> predicate)
        {
            return await _courseWorkRepository.FindAll(predicate).ToArrayAsync();
        }

        public async Task<CourseWork[]> GetAllCourseWorksAsync()
        {
            return await _courseWorkRepository.GetAll().ToArrayAsync();
        }

        public async Task<long> AddCourseWorkAsync(CourseWork courseWork)
        {
            return await _courseWorkRepository.AddAsync(courseWork);
        }

        public async Task DeleteCourseWorkAsync(long courseWorkId)
        {
            await _courseWorkRepository.DeleteAsync(courseWorkId);
        }

        public async Task UpdateCourseWorkAsync(long courseWorkId, CourseWork update)
        {
            await _courseWorkRepository.UpdateAsync(courseWorkId, courseWork => update);
        }

        public async Task<bool> AcceptStudentAsync(long courseWorkId, long studentId)
        {
            var courseWork = await _courseWorkRepository.GetAsync(courseWorkId).ConfigureAwait(false);
            var applications = await _applicationService
                .GetFilteredApplicationsAsync(a => a.CourseWorkId == courseWorkId && a.StudentId == studentId)
                .ConfigureAwait(false);
            var application = applications.FirstOrDefault();

            if (courseWork == null || courseWork.StudentId != null || application == null)
            {
                return false;
            }

            courseWork.StudentId = studentId;
            var t1 = _courseWorkRepository.UpdateAsync(courseWorkId, c => courseWork);
            var t2 = _applicationService.DeleteApplicationAsync(studentId, courseWorkId);
            var otherApplicationsCourseWorkTask =
                _applicationService.GetFilteredApplicationsAsync(a => a.CourseWorkId == courseWorkId);
            var otherApplicationsStudentTask =
                _applicationService.GetFilteredApplicationsAsync(a => a.StudentId == studentId);
            await Task.WhenAll(t1, t2, otherApplicationsCourseWorkTask, otherApplicationsStudentTask).ConfigureAwait(false);

            foreach (var app in otherApplicationsCourseWorkTask.Result)
            {
                await RejectStudentAsync(courseWorkId, app.StudentId).ConfigureAwait(false);
            }
            foreach (var app in otherApplicationsStudentTask.Result)
            {
                await _applicationService.DeleteApplicationAsync(studentId, app.CourseWorkId).ConfigureAwait(false);
            }

            return true;
        }

        public async Task<bool> RejectStudentAsync(long courseWorkId, long studentId)
        {
            var application = await _applicationService
                .GetFilteredApplicationsAsync(a => a.CourseWorkId == courseWorkId && a.StudentId == studentId)
                .ConfigureAwait(false);


            if (application == null)
            {
                return false;
            }

            await _applicationService.DeleteApplicationAsync(studentId, courseWorkId).ConfigureAwait(false);

            return true;
        }
    }
}
