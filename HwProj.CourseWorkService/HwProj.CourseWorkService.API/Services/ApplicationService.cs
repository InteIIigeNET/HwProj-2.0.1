using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services
{
    public class ApplicationService : IApplicationsService
    {
        private readonly IApplicationsRepository _applicationsRepository;
        private readonly ICourseWorksRepository _courseWorksRepository;
        private readonly UserManager<Student> _userManager;
        private readonly IMapper _mapper;

        public ApplicationService(IApplicationsRepository applicationsRepository, ICourseWorksRepository courseWorksRepository,
            UserManager<Student> userManager, IMapper mapper)
        {
            _applicationsRepository = applicationsRepository;
            _courseWorksRepository = courseWorksRepository;
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<OverviewApplicationDTO[]> GetFilteredApplications(Expression<Func<Application, bool>> predicate)
        {
            var applications = await _applicationsRepository
                .FindAll(predicate)
                .ToArrayAsync().ConfigureAwait(false);
            var overviewApplications = _mapper.Map<OverviewApplicationDTO[]>(applications);
            for (var i = 0; i < applications.Length; i++)
            {
                overviewApplications[i].CourseWorkTitle = applications[i].CourseWork.Title;
                overviewApplications[i].Date = applications[i].Date.ToString("MM/dd/yyyy");
            }

            return overviewApplications;
        }

        public LecturerApplicationDTO GetLecturerApplication(Application application)
        {
            var lecturerApplication = _mapper.Map<LecturerApplicationDTO>(application);
            lecturerApplication.CourseWorkTitle = application.CourseWork.Title;
            lecturerApplication.Date = application.Date.ToString("MM/dd/yyyy");
            lecturerApplication.StudentName = application.Student.UserName;
            lecturerApplication.StudentGroup = application.Student.Group;
            return lecturerApplication;
        }

        public StudentApplicationDTO GetStudentApplication(Application application)
        {
            var studentApplication = _mapper.Map<StudentApplicationDTO>(application);
            studentApplication.CourseWorkTitle = application.CourseWork.Title;
            studentApplication.CourseWorkSupervisorName = application.CourseWork.SupervisorName;
            studentApplication.Date = application.Date.ToString("MM/dd/yyyy");
            return studentApplication;
        }

        public async Task<long> AddApplication(CreateApplicationViewModel newApplication, string userId)
        {
            var application = _mapper.Map<Application>(newApplication);
            application.CourseWork =
                await _courseWorksRepository.GetAsync(newApplication.CourseWorkId).ConfigureAwait(false);
            application.Date = DateTime.UtcNow;
            application.StudentId = userId;
            application.Student = await _userManager.FindByIdAsync(userId).ConfigureAwait(false);
            return await _applicationsRepository.AddAsync(application).ConfigureAwait(false);
        }

        public async Task AcceptStudentApplication(Application application)
        {
            await _courseWorksRepository.UpdateAsync(application.CourseWorkId, cw => new CourseWork()
                {
                    StudentId = application.StudentId
                })
                .ConfigureAwait(false);

            var courseWork = application.CourseWork;
            foreach (var app in courseWork.Applications)
            {
                await _applicationsRepository.DeleteAsync(app.Id).ConfigureAwait(false);
            }

            var student = application.Student;
            foreach (var app in student.Applications)
            {
                await _applicationsRepository.DeleteAsync(app.Id).ConfigureAwait(false);
            }
        }
    }
}
