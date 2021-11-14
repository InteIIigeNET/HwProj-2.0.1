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
    public class DeadlinesController : ControllerBase
    {
        private readonly ICoursesServiceClient _coursesClient;

        public DeadlinesController(ICoursesServiceClient coursesClient)
        {
            _coursesClient = coursesClient;
        }
        
        [HttpGet]
        [Authorize]
        [ProducesResponseType(typeof(DeadlineViewModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllDeadlines()
        {
            var result = await _coursesClient.GetAllDeadlines();
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }
        
        [HttpPost("{taskId}/add")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Add(long taskId, AddDeadlineViewModel model)
        {
            var result = await _coursesClient.AddDeadline(model, taskId);
            return Ok(result);
        }

        [HttpDelete("{deadlineId}/delete")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteDeadline(long deadlineId)
        {
            await _coursesClient.DeleteTask(deadlineId);
            return Ok();
        }
        
        [HttpGet("{taskId}/get")]
        [Authorize]
        [ProducesResponseType(typeof(DeadlineViewModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetTaskDeadlinesAsync(long taskId)
        {
            var result = await _coursesClient.GetTaskDeadlinesAsync(taskId);
            return Ok(result);
        }
    }
}
