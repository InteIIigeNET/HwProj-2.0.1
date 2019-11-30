using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Filters;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.CourseWorkViewModels;
using HwProj.CourseWorkService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseWorkController : Controller
    {
        private readonly ICourseWorkService _courseWorkService;
        private readonly IMapper _mapper;

        public CourseWorkController(ICourseWorkService courseWorkService, IMapper mapper)
        {
            _courseWorkService = courseWorkService;
            _mapper = mapper;
        }

        [HttpGet("available_course_works")]
        public async Task<CourseWorkOverviewModel[]> GetAvailableCourseWorks()
        {
            var courseWorks = await _courseWorkService.GetFilteredCourseWorksAsync(new Filter() { IsAvailable = true });
            return _mapper.Map<CourseWorkOverviewModel[]>(courseWorks);
        }

        [HttpGet("available_course_works/{supervisorId}")]
        public async Task<CourseWorkOverviewModel[]> GetSupervisorAvailableCourseWorksAsync(string supervisorId)
        {
            var courseWorks = await _courseWorkService
                .GetFilteredCourseWorksAsync(new Filter() { SupervisorId = supervisorId, IsAvailable = true });
            return _mapper.Map<CourseWorkOverviewModel[]>(courseWorks);
        }

        [HttpGet("details/{courseWorkId}")]
        public async Task<CourseWorkDetailsModel> GetCourseWorkDetails(long courseWorkId)
        {
            var courseWork = await _courseWorkService.GetCourseWorkAsync(courseWorkId);
            return _mapper.Map<CourseWorkDetailsModel>(courseWork);
        }

        [HttpGet("student_course_work/{studentId}")]
        public async Task<IActionResult> GetStudentCourseWork(string studentId)
        {
            var courseWork = await _courseWorkService.GetStudentCourseWorkAsync(studentId);
            return Ok(courseWork);
        }

        [HttpDelete("{courseWorkId}")]
        public async Task<IActionResult> DeleteCourseWork(long courseWorkId)
        {
            await _courseWorkService.DeleteCourseWorkAsync(courseWorkId);
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> AddCourseWork([FromBody] CreateCourseWorkViewModel courseWorkViewModel)
        { 
            var creatorId = Request.GetUserId();
            var courseWork = _mapper.Map<CourseWork>(courseWorkViewModel);
            var wasCreatedBySupervisor = AuthExtensions.IsLecturer(Request.GetUserRole());
            var id = await _courseWorkService.AddCourseWorkAsync(courseWork, creatorId, wasCreatedBySupervisor);
            return Ok(id);
        }

        [HttpPost("update_course_work/{courseWorkId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> UpdateCourseWorkAsync(long courseWorkId,
            [FromBody] CreateCourseWorkViewModel courseWorkViewModel)
        {
            await _courseWorkService.UpdateCourseWorkAsync(courseWorkId, new CourseWork()
            {
                Title = courseWorkViewModel.Title,
                Description = courseWorkViewModel.Description,
                Type = courseWorkViewModel.Type,
                Publicity = courseWorkViewModel.Publicity,
                Requirements = courseWorkViewModel.Requirements,

                SupervisorContact = courseWorkViewModel.SupervisorContact,
                Consultant = courseWorkViewModel.Consultant,
                ConsultantContact = courseWorkViewModel.ConsultantContact
            });

            return Ok();
        }

        [HttpPost("accept_student/{courseWorkId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AcceptStudent(long courseWorkId, [FromQuery] string studentId)
        {
            return await _courseWorkService.AcceptStudentAsync(courseWorkId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpPost("reject_student/{courseWorkId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> RejectStudent(long courseWorkId, [FromQuery] string studentId)
        {
            return await _courseWorkService.RejectStudentAsync(courseWorkId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }
    }
}
