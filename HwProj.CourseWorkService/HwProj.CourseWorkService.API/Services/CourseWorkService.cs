using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public class CourseWorkService : ICourseWorkService
    {
        private readonly ICourseWorksRepository _courseWorkRepository;       
        private readonly IApplicationsRepository _applicationRepository;

        public CourseWorkService(ICourseWorksRepository courseWorkRepository, IApplicationsRepository applicationRepository)
        {
            _courseWorkRepository = courseWorkRepository;
            _applicationRepository = applicationRepository;
        }

        public async Task<CourseWork> GetCourseWorkAsync(long courseWorkId)
        {
            return await _courseWorkRepository.GetAsync(courseWorkId);
        }

        public async Task<CourseWork> GetStudentCourseWorkAsync(string studentId)
        {
            return await _courseWorkRepository.FindAsync(cw => cw.StudentId == studentId);
        }

        public async Task<CourseWork[]> GetAllCourseWorksAsync()
        {
            return await _courseWorkRepository.GetAll().ToArrayAsync();
        }

        public async Task<CourseWork[]> GetFilteredCourseWorksAsync(Filter filter)
        {
            IQueryable<CourseWork> courseWorks = _courseWorkRepository.GetAll();
            if (filter.StudentId != null)
            {
                courseWorks.Select(cw => cw.StudentId == filter.StudentId);
            }
            if (filter.SupervisorId != null)
            {
                courseWorks.Select(cw => cw.SupervisorId == filter.SupervisorId);
            }
            if (filter.ReviewerId != null)
            {
                courseWorks.Select(cw => cw.ReviewerId == filter.ReviewerId);
            }
            if (filter.IsAvailable != null)
            {
                courseWorks.Select(cw => cw.IsAvailable == filter.IsAvailable);
            }
            return await courseWorks.ToArrayAsync();
        }

        public async Task<long> AddCourseWorkAsync(CourseWork courseWork, string creatorId, bool wasCreatedBySupervisor)
        {
            courseWork.CreationTime = DateTime.Now;
            if (wasCreatedBySupervisor)
            {
                courseWork.SupervisorId = creatorId;
            }
            else
            {
                courseWork.StudentId = creatorId;
            }
            return await _courseWorkRepository.AddAsync(courseWork);
        }
        
        public async Task DeleteCourseWorkAsync(long courseWorkId)
        {
            await _courseWorkRepository.DeleteAsync(courseWorkId);
        }

        public async Task UpdateCourseWorkAsync(long courseWorkId, CourseWork update)
        {
            await _courseWorkRepository.UpdateAsync(courseWorkId, courseWork => new CourseWork()
            {
                Title = update.Title,
                Description = update.Description,
                Publicity = update.Publicity,
                Requirements = update.Requirements,
                Type = update.Type,

                Consultant = update.Consultant,
                ConsultantContact = update.ConsultantContact,
                SupervisorContact = update.SupervisorContact
            });
        }

        public async Task<bool> AcceptStudentAsync(long courseWorkId, string studentId)
        {
            var getCourseWorkTask = _courseWorkRepository.GetAsync(courseWorkId);
            var getApplicationTask = _applicationRepository
                .FindAsync(a => a.CourseWorkId == courseWorkId && a.StudentId == studentId);
            await Task.WhenAll(getApplicationTask, getCourseWorkTask);

            if (getCourseWorkTask.Result == null || getCourseWorkTask.Result.IsAvailable == false || getApplicationTask == null)
            {
                return false;
            }

            await _courseWorkRepository.UpdateAsync(
                getCourseWorkTask.Result.Id,
                courseWork => new CourseWork
                {
                    StudentId = studentId,
                    IsAvailable = false
                });

            return true;
        }

        public async Task<bool> RejectStudentAsync(long courseWorkId, string studentId)
        {
            var getCourseWorkTask = _courseWorkRepository.GetAsync(courseWorkId);
            var getApplicationTask = _applicationRepository
                .FindAsync(application => application.CourseWorkId == courseWorkId && application.StudentId == studentId);
            await Task.WhenAll(getCourseWorkTask, getApplicationTask);

            if (getCourseWorkTask.Result == null || getApplicationTask.Result == null)
            {
                return false;
            }

            await _applicationRepository.DeleteAsync(getApplicationTask.Result.Id);

            return true;
        }
    }
}
