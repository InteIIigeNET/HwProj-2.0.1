using AutoMapper;
using HwProj.CoursesService.API.Filters;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.ApplicationViewModels;
using HwProj.CourseWorkService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationController : Controller
    {
        private readonly IApplicationService _applicationService;
        private readonly IMapper _mapper;

        public ApplicationController(IApplicationService courseWorkService, IMapper mapper)
        {
            _applicationService = courseWorkService;
            _mapper = mapper;
        }

        [HttpGet("student/applications")]
        public async Task<StudentApplicationViewModel[]> GetAllStudentApplications()
        {
            var studentId = Request.GetUserId();
            var applications = await _applicationService.GetAllStudentApplicationsAsync(studentId);
            var viewModel = new List<StudentApplicationViewModel>();
            foreach (var application in applications)
            {
                var courseWorkApplications = await _applicationService.GetAllCourseWorkApplicationsAsync(application.CourseWorkId);
                var applicationCounter = courseWorkApplications.Length;
                viewModel.Add(new StudentApplicationViewModel() 
                {
                    ApplicationsCount = courseWorkApplications.Length, 
                    CourseWorkId = application.CourseWorkId 
                }); ;
            }
            return viewModel.ToArray();
        }

        [HttpGet("supervisor/applications")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<SupervisorApplicationViewModel[]> GetAllSupervisorApplications()
        {
            var supervisorId = Request.GetUserId();
            var applications = await _applicationService.GetAllSupervisorApplicationsAsync(supervisorId);
            return _mapper.Map<SupervisorApplicationViewModel[]>(applications);
        }

        [HttpGet("applications/{courseWorkId}")] 
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<SupervisorApplicationViewModel[]> GetCourseWorkApplications(long courseWorkId)
        {
            var applications = await _applicationService.GetAllCourseWorkApplicationsAsync(courseWorkId);
            return _mapper.Map<SupervisorApplicationViewModel[]>(applications);
        }

        [HttpPost("apply/{courseWorkId}")] 
        public async Task<IActionResult> ApplyToCourseWork([FromBody] CreateApplicationViewModel applicationViewModel, long courseWorkId)
        {
            var studentId = Request.GetUserId();
            var application = _mapper.Map<Application>(applicationViewModel);
            var id = await _applicationService.AddApplicationAsync(application, studentId, courseWorkId);
            return Ok(id);
        }

        [HttpPost("cancel/{courseWorkId}")] 
        public async Task<IActionResult> CancelApplicationToCourseWork(long courseWorkId)
        {
            var studentId = Request.GetUserId();
            await _applicationService.DeleteApplicationAsync(studentId, courseWorkId);
            return Ok();
        }
    }
}
