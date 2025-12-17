using System.Net;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TasksController(ICoursesServiceClient coursesClient) : ControllerBase
{
    [HttpGet("get/{taskId}")]
    [Authorize]
    [ProducesResponseType(typeof(HomeworkTaskViewModel), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetTask(long taskId, [FromQuery] bool? withCriterias)
    {
        var result = await coursesClient.GetTask(taskId, withCriterias ?? false);
        return result == null
            ? NotFound()
            : Ok(result);
    }

    [HttpGet("getForEditing/{taskId}")]
    [Authorize(Roles = Roles.LecturerRole)]
    [ProducesResponseType(typeof(HomeworkTaskForEditingViewModel), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetForEditingTask(long taskId)
    {
        var result = await coursesClient.GetForEditingTask(taskId);
        return result == null
            ? NotFound()
            : Ok(result);
    }

    [HttpPost("add/{homeworkId}")]
    [Authorize(Roles = Roles.LecturerRole)]
    [ProducesResponseType(typeof(Result<HomeworkTaskViewModel>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> AddTask(long homeworkId, CreateTaskViewModel taskViewModel)
    {
        var result = await coursesClient.AddTask(homeworkId, taskViewModel);
        return result.Succeeded
            ? Ok(result)
            : BadRequest(result);
    }

    [HttpDelete("delete/{taskId}")]
    [Authorize(Roles = Roles.LecturerRole)]
    public async Task<IActionResult> DeleteTask(long taskId)
    {
        await coursesClient.DeleteTask(taskId);
        return Ok();
    }

    [HttpPut("update/{taskId}")]
    [Authorize(Roles = Roles.LecturerRole)]
    [ProducesResponseType(typeof(Result<HomeworkTaskViewModel>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> UpdateTask(long taskId, CreateTaskViewModel taskViewModel)
    {
        var result = await coursesClient.UpdateTask(taskId, taskViewModel);
        return Ok(result);
    }

    [HttpPost("addQuestion")]
    [Authorize(Roles = Roles.StudentRole)]
    public async Task<IActionResult> AddQuestionForTask(AddTaskQuestionDto question)
    {
        await coursesClient.AddQuestionForTask(question);
        return Ok();
    }

    [HttpGet("questions/{taskId}")]
    [ProducesResponseType(typeof(GetTaskQuestionDto[]), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetQuestionsForTask(long taskId)
    {
        var result = await coursesClient.GetQuestionsForTask(taskId);
        return Ok(result);
    }

    [HttpPost("addAnswer")]
    [Authorize(Roles = Roles.LecturerOrExpertRole)]
    public async Task<IActionResult> AddAnswerForQuestion(AddAnswerForQuestionDto answer)
    {
        await coursesClient.AddAnswerForQuestion(answer);
        return Ok();
    }

    [HttpGet("openQuestions")]
    [Authorize(Roles = Roles.LecturerOrExpertRole)]
    [ProducesResponseType(typeof(QuestionsSummary[]), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetOpenQuestions()
    {
        var result = await coursesClient.GetOpenQuestions();
        return Ok(result);
    }
}
