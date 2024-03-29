﻿using System.Linq;
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
    [Route("api/[controller]")]
    public class CourseGroupsController : Controller
    {
        private readonly IGroupsService _groupsService;
        private readonly IMapper _mapper;

        public CourseGroupsController(IMapper mapper, IGroupsService groupsService)
        {
            _mapper = mapper;
            _groupsService = groupsService;
        }

        [HttpGet("{courseId}/getAll")]
        public async Task<GroupViewModel[]> GetAll(long courseId)
        {
            var groups = await _groupsService.GetAllAsync(courseId);

            var result = groups.Select(t => new GroupViewModel
            {
                Id = t.Id,
                StudentsIds = t.GroupMates.Select(s => s.StudentId).ToArray()
            }).ToArray();

            return result;
        }

        [HttpPost("{courseId}/create")]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupViewModel groupViewModel)
        {
            var group = new Group
            {
                CourseId = groupViewModel.CourseId,
                Name = groupViewModel.Name,
                GroupMates = groupViewModel.GroupMatesIds.Select(t => new GroupMate() { StudentId = t }).ToList()
            };
            var id = await _groupsService.AddGroupAsync(group);
            return Ok(id);
        }

        [HttpDelete("{courseId}/delete/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> DeleteGroup(long groupId)
        {
            await _groupsService.DeleteGroupAsync(groupId).ConfigureAwait(false);
            return Ok();
        }

        [HttpPost("{courseId}/update/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> UpdateGroup(long groupId, [FromBody] UpdateGroupViewModel groupViewModel)
        {
            await _groupsService.UpdateAsync(groupId, _mapper.Map<Group>(groupViewModel));
            return Ok();
        }

        [HttpGet("{courseId}/get")]
        public async Task<IActionResult> GetCoursesGroups(long courseId, [FromQuery] string userId)
        {
            var groups = await _groupsService.GetStudentGroupsAsync(courseId, userId);
            return Ok(groups);
        }

        [HttpPost("{courseId}/addStudentInGroup/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> AddStudentInGroup(long groupId, [FromQuery] string userId)
        {
            await _groupsService.AddGroupMateAsync(groupId, userId);
            return Ok();
        }

        [HttpPost("{courseId}/removeStudentFromGroup/{groupId}")]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        public async Task<IActionResult> RemoveStudentFromGroup(long groupId, [FromQuery] string userId)
        {
            return await _groupsService.DeleteGroupMateAsync(groupId, userId)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromBody] long[] groupIds)
        {
            var groups = await _groupsService.GetGroupsAsync(groupIds);
            var result = groups.Select(group => new GroupViewModel
            {
                Id = group.Id,
                StudentsIds = group.GroupMates.Select(g => g.StudentId).ToArray()
            }).ToArray();
            return Ok(result) as IActionResult;
        }
    }
}
