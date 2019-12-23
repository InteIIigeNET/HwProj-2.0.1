using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.ViewModels;
using HwProj.CoursesService.API.Services;
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

        [HttpGet("get_all")]
        public async Task<GroupViewModel[]> GetAll(long courseId)
        {
            var groups = await _groupsService.GetAllAsync(courseId).ConfigureAwait(false);
            return _mapper.Map<GroupViewModel[]>(groups);
        }

        [HttpPost]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupViewModel groupViewModel)
        {
            var group = _mapper.Map<Group>(groupViewModel);
            var id = await _groupsService.AddGroupAsync(group);
            return Ok(id);
        }

        [HttpDelete("{groupId}")]
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
            await _groupsService.UpdateAsync(groupId, _mapper.Map<Group>(groupViewModel)).ConfigureAwait(false);
            return Ok();
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetCoursesGroups(long courseId, string userId)
        {
            var groups = await _groupsService.GetStudentGroupsAsync(courseId, userId).ConfigureAwait(false);
            return Ok(groups);
        }

        [HttpPost("add_student_in_group/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddStudentInGroup(long groupId, [FromBody] string studentId)
        {
            await _groupsService.AddGroupMateAsync(groupId, studentId).ConfigureAwait(false);
            return Ok() as IActionResult;
        }

        [HttpPost("remove_student_from_group/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> RemoveStudentFromGroup(long groupId, string studentId)
        {
            return await _groupsService.DeleteGroupMateAsync(groupId, studentId).ConfigureAwait(false)
                ? Ok()
                : NotFound() as IActionResult;
        }
    }
}