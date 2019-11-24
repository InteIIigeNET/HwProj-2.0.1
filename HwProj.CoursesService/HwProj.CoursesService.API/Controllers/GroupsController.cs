using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.ViewModels;
using HwProj.CoursesService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace HwProj.CoursesService.API.Controllers
{
    public class GroupsController : Controller
    {
        private readonly ICoursesService _coursesService;
        private readonly IGroupsService _groupsService;
        private readonly IMapper _mapper;

        public GroupsController(ICoursesService coursesService, IMapper mapper, IGroupsService groupsService)
        {
            _coursesService = coursesService;
            _mapper = mapper;
            _groupsService = groupsService;
        }


        [HttpPost("create_new_group/{coursId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> CreateGroup(long courseId, [FromBody] CreateGroupViewModel groupViewModel)
        {
            var group = _mapper.Map<Group>(groupViewModel);
            var id = await _groupsService.AddAsync(group, courseId);
            return Ok(id);
        }

        [HttpPost("add_student_in_group")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddStudentInGroup(long groupId, string studentId)
        {
            return await _groupsService.AddCourseMateInGroupAsync(groupId, studentId)
                ? Ok()
                : NotFound() as IActionResult;
        }
    }
}
