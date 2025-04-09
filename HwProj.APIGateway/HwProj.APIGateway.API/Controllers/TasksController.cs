using System.Net;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using HwProj.Utils.Authorization;
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

        [HttpPost("add/{homeworkId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddTask(long homeworkId, CreateTaskViewModel taskViewModel)
        {
            var result = await _coursesClient.AddTask(homeworkId, taskViewModel);
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

        [HttpPut("update/{taskId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(Result<HomeworkTaskViewModel>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateTask(long taskId, CreateTaskViewModel taskViewModel)
        {
            var result = await _coursesClient.UpdateTask(taskId, taskViewModel);
            return Ok(result);
        }

        [HttpPost("addQuestion")]
        [Authorize(Roles = Roles.StudentRole)]
        public async Task<IActionResult> AddQuestionForTask(AddTaskQuestionDto question)
        {
            await _coursesClient.AddQuestionForTask(question);
            return Ok();
        }

        [HttpGet("questions/{taskId}")]
        [ProducesResponseType(typeof(GetTaskQuestionDto[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetQuestionsForTask(long taskId)
        {
            var result = await _coursesClient.GetQuestionsForTask(taskId);
            return Ok(result);
        }

        [HttpPost("addAnswer")]
        [Authorize(Roles = Roles.LecturerOrExpertRole)]
        public async Task<IActionResult> AddAnswerForQuestion(AddAnswerForQuestionDto answer)
        {
            await _coursesClient.AddAnswerForQuestion(answer);
            return Ok();
        }
    }
}
