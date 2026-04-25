using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.Services;
using HwProj.CoursesService.Client;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LtiAdvantage.AssignmentGradeServices;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti")]
[ApiController]
[Authorize(AuthenticationSchemes = "LtiScheme")]
public class LtiAssignmentsGradesControllers(
    ICoursesServiceClient coursesServiceClient,
    ISolutionsServiceClient solutionsClient,
    ILtiToolService toolService)
    : ControllerBase
{
    [HttpPost("lineItem/{taskId}/scores")]
    [Consumes("application/json", "application/vnd.ims.lis.v1.score+json")]
    public async Task<IActionResult> UpdateTaskScore(long taskId, [FromBody] Score score)
    {
        var scopeClaim = User.FindFirst("scope")?.Value;
        if (string.IsNullOrEmpty(scopeClaim) || !scopeClaim.Contains("https://purl.imsglobal.org/spec/lti-ags/scope/score"))
        {
            return Forbid();
        }

        var toolClientId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(toolClientId))
        {
            return Unauthorized("Unknown tool client id.");
        }

        var tool = toolService.GetByClientId(toolClientId);
        if (tool == null)
        {
            return BadRequest("Tool not found.");
        }

        var course = await coursesServiceClient.GetCourseByTaskForLti(taskId, score.UserId);
        if (course == null)
        {
            return BadRequest("The task does not belong to any course.");
        }

        if (course.LtiToolName != tool.Name)
        {
            return BadRequest("This tool does not apply to this course.");
        }

        if (score.ScoreGiven < 0 || score.ScoreGiven > score.ScoreMaximum)
        {
            return BadRequest("ScoreGiven must be between 0 and ScoreMaximum.");
        }

        try
        {
            await solutionsClient.PostAndRateSolutionForLti(
                taskId: taskId,
                userId: score.UserId,
                scoreGiven: score.ScoreGiven,
                scoreMaximum: score.ScoreMaximum,
                comment: $"Результат: {score.ScoreGiven}/{score.ScoreMaximum}\n\n" + score.Comment);

            return Ok(new { message = "Score updated successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception)
        {
            return StatusCode(500, "Internal Server Error");
        }
    }
}