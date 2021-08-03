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
        public async Task<IActionResult> UpdateCourse(UpdateCourseViewModel model, long courseId)
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
        
        [HttpPost("{courseId}/Homeworks/add")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddHomework(CreateHomeworkViewModel homeworkViewModel, long courseId)
        {
            var result = await _coursesClient.AddHomeworkToCourse(homeworkViewModel, courseId);
            return Ok(result);
        } 

        [HttpDelete("{courseId}/Homeworks/delete/{homeworkId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteHomework(long courseId, long homeworkId)
        {
            await _coursesClient.DeleteHomework(courseId, homeworkId);
            return Ok();
        }

        [HttpPut("{courseId}/Homeworks/update/{homeworkId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateHomework(CreateHomeworkViewModel homeworkViewModel, long courseId, long homeworkId)
        {
            await _coursesClient.UpdateHomework(homeworkViewModel, courseId, homeworkId);
            return Ok();
        }
        
        [HttpPost("{courseId}/Homeworks/{homeworkId}/Tasks/add")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddTask(CreateTaskViewModel taskViewModel, long courseId, long homeworkId)
        {
            var result = await _coursesClient.AddTask(courseId, homeworkId, taskViewModel);
            return Ok(result);
        } 
        
        [HttpPut("{courseId}/Homeworks/{homeworkId}/Tasks/update/{taskId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateTask(CreateTaskViewModel taskViewModel,
            long courseId, long homeworkId, long taskId)
        {
            await _coursesClient.UpdateTask(courseId, homeworkId, taskId, taskViewModel);
            return Ok();
        }
    }
}
