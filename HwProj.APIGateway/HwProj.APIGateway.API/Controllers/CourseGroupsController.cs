using System.Net;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseGroupsController : AggregationController
    {
        private readonly ICoursesServiceClient _coursesClient;

        public CourseGroupsController(ICoursesServiceClient coursesClient)
        {
            _coursesClient = coursesClient;
        }

        [HttpGet("{courseId}/getAll")]
        [ProducesResponseType(typeof(GroupViewModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllCourseGroups(long courseId)
        {
            var result = await _coursesClient.GetAllCourseGroups(courseId);
            return result == null
                ? NotFound()
                : Ok(result);
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
            var result = await _coursesClient.GetCourseGroupsById(courseId, UserId);
            return result == null
                ? NotFound()
                : Ok(result);
        }

        [HttpPost("{courseId}/addStudentInGroup/{groupId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> AddStudentInGroup(long courseId, long groupId, [FromQuery] string userId)
        {
            await _coursesClient.AddStudentInGroup(courseId, groupId, userId);
            return Ok();
        }

        [HttpPost("{courseId}/removeStudentFromGroup/{groupId}")]
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
                : Ok(result);
        }

        [HttpGet("getTasks/{groupId}")]
        [ProducesResponseType(typeof(long[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetGroupTasks(long groupId)
        {
            var result = await _coursesClient.GetGroupTasks(groupId);
            return Ok(result);
        }
    }
}
