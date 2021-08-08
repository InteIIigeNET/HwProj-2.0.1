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
        
        [HttpPost("signInCourse/{courseId}")]
        [Authorize]
        public async Task<IActionResult> SignInCourse(long courseId)
        {
            var studentId = Request.GetUserId();
            await _coursesClient.SignInCourse(courseId, studentId);
            return Ok();
        }
        
        [HttpPost("acceptStudent/{courseId}/{studentId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> AcceptStudent(long courseId, string studentId)
        {
            await _coursesClient.AcceptStudent(courseId, studentId);
            return Ok();
        }
        
        [HttpPost("rejectStudent/{courseId}/{studentId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> RejectStudent(long courseId, string studentId)
        {
            await _coursesClient.RejectStudent(courseId, studentId);
            return Ok();
        }
        
        [HttpGet("userCourses")]
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

        [HttpGet("Homeworks/get/{homeworkId}")]
        [Authorize]
        [ProducesResponseType(typeof(HomeworkViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetHomework(long homeworkId)
        {
            var result = await _coursesClient.GetHomework(homeworkId);
            return Ok(result);
        } 
        
        [HttpPost("Homeworks/{courseId}/add")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddHomework(CreateHomeworkViewModel homeworkViewModel, long courseId)
        {
            var result = await _coursesClient.AddHomeworkToCourse(homeworkViewModel, courseId);
            return Ok(result);
        } 

        [HttpDelete("Homeworks/delete/{homeworkId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteHomework(long homeworkId)
        {
            await _coursesClient.DeleteHomework(homeworkId);
            return Ok();
        }

        [HttpPut("Homeworks/update/{homeworkId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateHomework(CreateHomeworkViewModel homeworkViewModel, long homeworkId)
        {
            await _coursesClient.UpdateHomework(homeworkViewModel, homeworkId);
            return Ok();
        }
        
        [HttpGet("Homeworks/Tasks/get/{taskId}")]
        [ProducesResponseType(typeof(HomeworkTaskViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var result = await _coursesClient.GetTask(taskId);
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }
        
        [HttpPost("Homeworks/{homeworkId}/Tasks/add")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddTask(CreateTaskViewModel taskViewModel, long homeworkId)
        {
            var result = await _coursesClient.AddTask(taskViewModel, homeworkId);
            return Ok(result);
        }

        [HttpDelete("Homeworks/Tasks/delete/{taskId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteTask(long taskId)
        {
            await _coursesClient.DeleteTask(taskId);
            return Ok();
        }
        
        [HttpPut("Homeworks/Tasks/update/{taskId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateTask(CreateTaskViewModel taskViewModel, long taskId)
        {
            await _coursesClient.UpdateTask(taskViewModel, taskId);
            return Ok();
        }
        
        [HttpGet("{courseId}/getAll")]
        [ProducesResponseType(typeof(GroupViewModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllCourseGroups(long courseId)
        {
            var result = await _coursesClient.GetAllCourseGroups(courseId);
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }
        
        [HttpPost("{courseId}/create")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> CreateCourseGroup(CreateCourseViewModel model, long courseId)
        {
            var result = await _coursesClient.CreateCourseGroup(model, courseId);
            return Ok(result);
        }
        
        [HttpDelete("{courseId}/delete/{groupId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteCourseGroup(long courseId, long groupId)
        {
            await _coursesClient.DeleteCourseGroup(courseId, groupId);
            return Ok();
        }
        
        [HttpPost("{courseId}/update/{groupId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateCourseGroup(UpdateGroupViewModel model, long courseId, long groupId)
        {
            await _coursesClient.UpdateCourseGroup(model, courseId, groupId);
            return Ok();
        }
        
        [HttpGet("{courseId}/get")]
        [Authorize]
        [ProducesResponseType(typeof(GroupViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseGroupsById(long courseId)
        {
            var userId = Request.GetUserId();
            var result = await _coursesClient.GetCourseGroupsById(courseId, userId);
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }
        
        [HttpPost("{courseId}/addStudentInGroup/{groupId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> AddStudentInGroup(long courseId, long groupId)
        {
            var userId = Request.GetUserId();
            await _coursesClient.AddStudentInGroup(courseId, groupId, userId);
            return Ok();
        }
        
        [HttpPost("{courseId}/removeStudentFromGroup/{groupId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> RemoveStudentFromGroup(long courseId, long groupId)
        {
            var userId = Request.GetUserId();
            await _coursesClient.RemoveStudentFromGroup(courseId, groupId, userId);
            return Ok();
        }

        [HttpGet("get/{groupId}")]
        [ProducesResponseType(typeof(GroupViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetGroup(long groupId)
        {
            var result = await _coursesClient.GetGroupById(groupId);
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }
        
        [HttpGet("getTasks/{groupId}")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetGroupTasks(long groupId)
        {
            var result = await _coursesClient.GetGroupTasks(groupId);
            return Ok(result);
        }
    }
}
