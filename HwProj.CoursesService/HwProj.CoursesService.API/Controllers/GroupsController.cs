using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Filters;
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

        [HttpGet("{groupId}")]
        public async Task<IActionResult> Get(long groupId)
        {
            var group = await _groupsService.GetGroupAsync(groupId);
            return group == null
                ? NotFound()
                : Ok(_mapper.Map<GroupViewModel>(group)) as IActionResult;
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

        [HttpGet("get_tasks/{groupId}")]
        public async Task<IActionResult> GetGroupTasks(long groupId)
        {
            var ids = await _groupsService.GetTasksIds(groupId).ConfigureAwait(false);
            return Ok(ids);
        }
    }
}
