using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Controllers
{
    [ApiController]
    [Route("api/[controller]/{courseId}")]
    public class CourseGroupsController : Controller
    {
        private readonly IGroupsService _groupsService;
        private readonly IMapper _mapper;

        public CourseGroupsController(IMapper mapper, IGroupsService groupsService)
        {
            _mapper = mapper;
            _groupsService = groupsService;
        }

        [HttpGet("getAll")]
        public async Task<GroupViewModel[]> GetAll(long courseId)
        {
            var groups = await _groupsService.GetAllAsync(courseId);
            return _mapper.Map<GroupViewModel[]>(groups);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupViewModel groupViewModel)
        {
            var group = _mapper.Map<Group>(groupViewModel);
            var id = await _groupsService.AddGroupAsync(group);
            return Ok(id);
        }

        [HttpDelete("delete/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> DeleteGroup(long groupId)
        {
            await _groupsService.DeleteGroupAsync(groupId).ConfigureAwait(false);
            return Ok();
        }

        [HttpPost("update/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> UpdateGroup(long groupId, [FromBody] UpdateGroupViewModel groupViewModel)
        {
            await _groupsService.UpdateAsync(groupId, _mapper.Map<Group>(groupViewModel));
            return Ok();
        }

        [HttpGet("get")]
        public async Task<IActionResult> GetCoursesGroups(long courseId, [FromQuery] string userId)
        {
            var groups = await _groupsService.GetStudentGroupsAsync(courseId, userId);
            return Ok(groups);
        }

        [HttpPost("addStudentInGroup/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddStudentInGroup(long groupId, [FromQuery] string userId)
        {
            await _groupsService.AddGroupMateAsync(groupId, userId);
            return Ok();
        }

        [HttpPost("removeStudentFromGroup/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> RemoveStudentFromGroup(long groupId, [FromQuery] string userId)
        {
            return await _groupsService.DeleteGroupMateAsync(groupId, userId)
                ? Ok()
                : NotFound() as IActionResult;
        }
    }
}
