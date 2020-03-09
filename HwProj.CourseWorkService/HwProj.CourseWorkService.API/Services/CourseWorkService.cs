using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public class CourseWorkService : EntityService<CourseWork>, ICourseWorkService
    {
        private readonly ICourseWorksRepository _courseWorkRepository;       
        private readonly IApplicationService _applicationService;

        public CourseWorkService(ICourseWorksRepository courseWorkRepository, IApplicationService applicationService)
        : base(courseWorkRepository)
        {
            _courseWorkRepository = courseWorkRepository;
            _applicationService = applicationService;
        }

        public async Task<CourseWork> GetStudentCourseWorkAsync(long studentId)
        {
            return await _courseWorkRepository.FindAsync(cw => cw.StudentId == studentId);
        }

        public async Task<bool> AcceptStudentAsync(long courseWorkId, long studentId)
        {
            var courseWork = await _courseWorkRepository.GetAsync(courseWorkId).ConfigureAwait(false);
            var applications = await _applicationService
                .GetFilteredAsync(a => a.CourseWorkId == courseWorkId && a.StudentId == studentId)
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
                _applicationService.GetFilteredAsync(a => a.CourseWorkId == courseWorkId);
            var otherApplicationsStudentTask =
                _applicationService.GetFilteredAsync(a => a.StudentId == studentId);
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
                .GetFilteredAsync(a => a.CourseWorkId == courseWorkId && a.StudentId == studentId)
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
