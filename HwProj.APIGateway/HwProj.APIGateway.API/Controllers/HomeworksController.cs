﻿using System.Net;
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
    public class HomeworksController : ControllerBase
    {
        private readonly ICoursesServiceClient _coursesClient;

        public HomeworksController(ICoursesServiceClient coursesClient)
        {
            _coursesClient = coursesClient;
        }
        
        [HttpGet("get/{homeworkId}")]
        [Authorize]
        [ProducesResponseType(typeof(HomeworkViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetHomework(long homeworkId)
        {
            var result = await _coursesClient.GetHomework(homeworkId);
            return Ok(result);
        }

        [HttpGet("getForEditing/{homeworkId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(HomeworkViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetForEditingHomework(long homeworkId)
        {
            var result = await _coursesClient.GetForEditingHomework(homeworkId);
            return Ok(result);
        }

        [HttpPost("{courseId}/add")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddHomework(CreateHomeworkViewModel homeworkViewModel, long courseId)
        {
            var result = await _coursesClient.AddHomeworkToCourse(homeworkViewModel, courseId);
            return result.Succeeded
                ? Ok(result.Value) as IActionResult
                : BadRequest(result.Errors);
        } 

        [HttpDelete("delete/{homeworkId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteHomework(long homeworkId)
        {
            await _coursesClient.DeleteHomework(homeworkId);
            return Ok();
        }

        [HttpPut("update/{homeworkId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateHomework(long homeworkId, CreateHomeworkViewModel homeworkViewModel)
        {
            var result = await _coursesClient.UpdateHomework(homeworkId, homeworkViewModel);
            return result.Succeeded
                ? Ok() as IActionResult
                : BadRequest(result.Errors);
        }
    }
}
