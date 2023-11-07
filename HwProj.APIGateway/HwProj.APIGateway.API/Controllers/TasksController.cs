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
    public class TasksController : ControllerBase
    {
        private readonly ICoursesServiceClient _coursesClient;

        public TasksController(ICoursesServiceClient coursesClient)
        {
            _coursesClient = coursesClient;
        }

        [HttpGet("get/{taskId}")]
        [Authorize]
        [ProducesResponseType(typeof(HomeworkTaskViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var result = await _coursesClient.GetTask(taskId);
            return result == null
                ? NotFound() as IActionResult
                : Ok(result);
        }

        [HttpGet("getForEditing/{taskId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(HomeworkTaskForEditingViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetForEditingTask(long taskId)
        {
            var result = await _coursesClient.GetForEditingTask(taskId);
            return result == null
                ? NotFound() as IActionResult
                : Ok(result);
        }

        [HttpPost("add")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddTask(CreateTaskViewModel taskViewModel)
        {
            var result = await _coursesClient.AddTask(taskViewModel);
            return result.Succeeded
                ? Ok(result.Value) as IActionResult
                : BadRequest(result.Errors);
        }

        [HttpDelete("delete/{taskId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteTask(long taskId)
        {
            await _coursesClient.DeleteTask(taskId);
            return Ok();
        }
        
        [HttpPut("update")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateTask(CreateTaskViewModel taskViewModel)
        {
            //taskViewModel.Id = taskId;

            var result = await _coursesClient.UpdateTask(taskViewModel);
            return result.Succeeded
                ? Ok() as IActionResult
                : BadRequest(result.Errors);
        }
    }
}
