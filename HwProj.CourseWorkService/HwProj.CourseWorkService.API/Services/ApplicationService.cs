using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services
{
    public class ApplicationService : IApplicationsService
    {
        private readonly IApplicationsRepository _applicationsRepository;
        private readonly ICourseWorksRepository _courseWorksRepository;
        private readonly IMapper _mapper;

        public ApplicationService(IApplicationsRepository applicationsRepository,
            ICourseWorksRepository courseWorksRepository, IMapper mapper)
        {
            _applicationsRepository = applicationsRepository;
            _courseWorksRepository = courseWorksRepository;
            _mapper = mapper;
        }

        public async Task<OverviewApplicationDTO[]> GetFilteredApplicationsAsync(Expression<Func<Application, bool>> predicate)
        {
            var applications = await _applicationsRepository
                .FindAll(predicate).Include(a => a.CourseWork)
                .ToArrayAsync().ConfigureAwait(false);
            var overviewApplications = _mapper.Map<OverviewApplicationDTO[]>(applications);
            for (var i = 0; i < applications.Length; i++)
            {
                overviewApplications[i].CourseWorkTitle = applications[i].CourseWork.Title;
            }

            return overviewApplications;
        }

        public LecturerApplicationDTO GetLecturerApplication(Application application)
        {
            var lecturerApplication = _mapper.Map<LecturerApplicationDTO>(application);
            lecturerApplication.CourseWorkTitle = application.CourseWork.Title;
            lecturerApplication.StudentName = application.StudentProfile.User.UserName;
            lecturerApplication.StudentGroup = application.StudentProfile.Group;
            return lecturerApplication;
        }

        public StudentApplicationDTO GetStudentApplication(Application application)
        {
            var studentApplication = _mapper.Map<StudentApplicationDTO>(application);
            studentApplication.CourseWorkTitle = application.CourseWork.Title;
            studentApplication.CourseWorkSupervisorName = application.CourseWork.SupervisorName;
            return studentApplication;
        }

        public async Task<long> AddApplicationAsync(CreateApplicationViewModel newApplication, string userId, CourseWork courseWork)
        {
            var application = _mapper.Map<Application>(newApplication);
            application.Date = DateTime.UtcNow;
            application.StudentProfileId = userId;
            application.CourseWorkId = courseWork.Id;
            return await _applicationsRepository.AddAsync(application).ConfigureAwait(false);
        }

        public async Task AcceptStudentApplicationAsync(Application application)
        {
            await _courseWorksRepository.UpdateAsync(application.CourseWorkId, cw => new CourseWork()
                {
                    StudentId = application.StudentProfileId
                })
                .ConfigureAwait(false);

            var courseWork = application.CourseWork;
            foreach (var app in courseWork.Applications)
            {
                await _applicationsRepository.DeleteAsync(app.Id).ConfigureAwait(false);
            }

            var student = application.StudentProfile;
            foreach (var app in student.Applications)
            {
                await _applicationsRepository.DeleteAsync(app.Id).ConfigureAwait(false);
            }
        }
    }
}
