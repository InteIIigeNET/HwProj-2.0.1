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
    [Route("api/[controller]")]
    public class GroupsController : Controller
    {
        private readonly IGroupsService _groupsService;
        private readonly IMapper _mapper;

        public GroupsController(IMapper mapper, IGroupsService groupsService)
        {
            _mapper = mapper;
            _groupsService = groupsService;
        }

        [HttpGet("GetAll/{courseId}")]
        public async Task<GroupViewModel[]> GetAll(long courseId)
        {
            var groups = await _groupsService.GetAllAsync(courseId).ConfigureAwait(false);
            return _mapper.Map<GroupViewModel[]>(groups);
        }

        [HttpGet("{groupId}")]
        public async Task<IActionResult> Get(long groupId)
        {
            var group = await _groupsService.GetGroupAsync(groupId);
            return group == null
                ? NotFound()
                : Ok(_mapper.Map<GroupViewModel>(group)) as IActionResult;
        }

        [HttpPost("{courseId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupViewModel groupViewModel)
        {
            var group = _mapper.Map<Group>(groupViewModel);
            var id = await _groupsService.AddGroupAsync(group);
            groupViewModel.GroupMates.ForEach(async cm => await AddStudentInGroup(id, cm.StudentId).ConfigureAwait(false));
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
            await _groupsService.UpdateAsync(groupId, new Group
            {
                Name = groupViewModel.Name
            }).ConfigureAwait(false);

            return Ok();
        }

        [HttpPost("add_student_in_group/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddStudentInGroup(long groupId, [FromBody] string studentId)
        {
            await _groupsService.AddGroupMateAsync(groupId, studentId);
            return Ok() as IActionResult;
        }

        [HttpPost("remove_student_from_group/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> RemoveStudentFromGroup(long groupId, string studentId)
        {
            return await _groupsService.DeleteGroupMateAsync(groupId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpGet("user_Groups/{courseId}/{userId}")]
        public async Task<IActionResult> GetCoursesGroups(long courseId, string userId)
        {
            var groups = await _groupsService.GetStudentsGroupsAsync(courseId, userId);
            return Ok(groups);
        }
    }
}
