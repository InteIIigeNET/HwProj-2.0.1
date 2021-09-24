using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.AuthService;
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
    public class CourseGroupsController : ControllerBase
    {
        private readonly ICoursesServiceClient _coursesClient;
        private readonly IAuthServiceClient _authClient;

        public CourseGroupsController(ICoursesServiceClient coursesClient, IAuthServiceClient authClient)
        {
            _coursesClient = coursesClient;
            _authClient = authClient;
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
        public async Task<IActionResult> CreateCourseGroup(CreateGroupViewModel model, long courseId)
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
        public async Task<IActionResult> AddStudentInGroup(long courseId, long groupId, [FromQuery] string userId)
        {
            await _coursesClient.AddStudentInGroup(courseId, groupId, userId);
            return Ok();
        }
        
        [HttpDelete("{courseId}/removeStudentFromGroup/{groupId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> RemoveStudentFromGroup(long courseId, long groupId, [FromQuery] string userId)
        {
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
        [ProducesResponseType(typeof(long[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetGroupTasks(long groupId)
        {
            var result = await _coursesClient.GetGroupTasks(groupId);
            return Ok(result);
        }

        [HttpGet("{courseId}/getCourseData")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(CourseGroupDTO), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetGroupData(long courseId)
        {
            var cm = await _coursesClient.GetAllStudentsWithoutGroup(courseId);
            var groups = await _coursesClient.GetAllCourseGroups(courseId);
            var courseMatesWithoutGroup = await _authClient.GetStudentData(new StudentsModel(cm));
            return Ok(new CourseGroupDTO()
            {
                StudentsWithoutGroup = courseMatesWithoutGroup,
                Groups = groups
            });
        }

        [HttpGet("{courseId}/getStudentGroup")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetStudentGroupId(long courseId)
        {
            var studentId = Request.GetUserId();
            var groups = await _coursesClient.GetAllCourseGroups(courseId);
            foreach (var group in groups)
            {
                foreach (var groupMate in group.GroupMates)
                {
                    if (groupMate.StudentId == studentId)
                    {
                        return Ok(group.Id);
                    }
                }
            }

            return Ok((long) -1);
        }
    }
}
