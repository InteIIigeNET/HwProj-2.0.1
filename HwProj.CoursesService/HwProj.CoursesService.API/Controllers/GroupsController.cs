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
            var groups = await _groupsService.GetAllAsync(courseId);
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
        public async Task<IActionResult> CreateGroup(long courseId, [FromBody] CreateGroupViewModel groupViewModel)
        {
            var group = _mapper.Map<Group>(groupViewModel);
            var id = await _groupsService.AddGroupAsync(group, courseId);
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
        public async Task<IActionResult> AddStudentInGroup(long groupId, string studentId)
        {
            return await _groupsService.AddCourseMateInGroupAsync(groupId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpPost("remove_student_from_group/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> RemoveStudentFromGroup(long groupId, string studentId)
        {
            return await _groupsService.DeleteCourseMateFromGroupAsync(groupId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }
    }
}
