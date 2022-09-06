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
        [ProducesResponseType(typeof(HomeworkTaskViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetTask(long taskId)
        {
            var result = await _coursesClient.GetTask(taskId);
            return result == null
                ? NotFound()
                : Ok(result);
        }
        
        [HttpPost("add/{homeworkId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddTask(CreateTaskViewModel taskViewModel, long homeworkId)
        {
            var result = await _coursesClient.AddTask(taskViewModel, homeworkId);
            return Ok(result.Value);
        }

        [HttpDelete("delete/{taskId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteTask(long taskId)
        {
            await _coursesClient.DeleteTask(taskId);
            return Ok();
        }
        
        [HttpPut("update/{taskId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> UpdateTask(CreateTaskViewModel taskViewModel, long taskId)
        {
            await _coursesClient.UpdateTask(taskViewModel, taskId);
            return Ok();
        }
    }
}
