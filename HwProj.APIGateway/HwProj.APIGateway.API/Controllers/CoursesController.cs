using System.Net;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Roles;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly ICoursesServiceClient _coursesClient;

        public CoursesController(ICoursesServiceClient coursesClient)
        {
            _coursesClient = coursesClient;
        }

        [HttpGet]
        [ProducesResponseType(typeof(CourseViewModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllCourses()
        {
            var result = await _coursesClient.GetAllCourses();
            return Ok(result);
        }
        
        [HttpGet("{courseId}")]
        [ProducesResponseType(typeof(CourseViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseData(long courseId)
        {
            var result = await _coursesClient.GetCourseById(courseId);
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }
        
        [HttpDelete("{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteCourse(long courseId)
        {
            await _coursesClient.DeleteCourse(courseId);
            return Ok();
        }
        
        [HttpPost("create")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> CreateCourse(CreateCourseViewModel model)
        {
            var mentorId = Request.GetUserId();
            var result = await _coursesClient.CreateCourse(model, mentorId);
            return Ok(result);
        }
        
        [HttpPost("update/{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateCourse(CourseViewModel model, long courseId)
        {
            await _coursesClient.UpdateCourse(model, courseId);
            return Ok();
        }
        
        [HttpPost("sign_in_course/{courseId}")]
        [Authorize]
        public async Task<IActionResult> SignInCourse(long courseId)
        {
            var studentId = Request.GetUserId();
            await _coursesClient.SignInCourse(courseId, studentId);
            return Ok();
        }
        
        [HttpPost("accept_student/{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> AcceptStudent(long courseId)
        {
            var studentId = Request.GetUserId();
            await _coursesClient.AcceptStudent(courseId, studentId);
            return Ok();
        }
        
        [HttpPost("reject_student/{courseId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> RejectStudent(long courseId)
        {
            var studentId = Request.GetUserId();
            await _coursesClient.RejectStudent(courseId, studentId);
            return Ok();
        }
        
        [HttpGet("user_courses")]
        [Authorize]
        [ProducesResponseType(typeof(UserCourseDescription[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllUserCourses()
        {
            var userId = Request.GetUserId();
            var result = await _coursesClient.GetAllUserCourses(userId);
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }
        
        [HttpPost("{courseId}/Homeworks")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddHomework(long courseId, CreateHomeworkViewModel homeworkViewModel)
        {
            var result = await _coursesClient.AddHomeworkToCourse(homeworkViewModel, courseId);
            return Ok(result);
        } 

        [HttpDelete("courseId/Homeworks/delete/{homeworkId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteHomework(long homeworkId)
        {
            await _coursesClient.DeleteCourse(homeworkId);
            return Ok();
        }

        [HttpPut("courseId/Homeworks/update/{homeworkId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateHomework(long homeworkId, CreateHomeworkViewModel homeworkViewModel)
        {
            await _coursesClient.UpdateHomework(homeworkViewModel, homeworkId);
            return Ok();
        }
    }
}
