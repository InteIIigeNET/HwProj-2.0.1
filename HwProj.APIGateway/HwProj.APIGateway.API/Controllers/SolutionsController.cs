using System.Net;
using System.Threading.Tasks;
using HwProj.Models.Roles;
using HwProj.Models.SolutionsService;
using HwProj.NotificationsService.Client;
using HwProj.SolutionsService.Client;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SolutionsController : ControllerBase
    {
        private readonly INotificationsServiceClient _notificationsClient;
        private readonly ISolutionsServiceClient _solutionsClient;

        public SolutionsController(ISolutionsServiceClient solutionsClient, INotificationsServiceClient notificationsClient)
        {
            _notificationsClient = notificationsClient;
            _solutionsClient = solutionsClient;
        }
        
        [HttpGet]
        [ProducesResponseType(typeof(Solution[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllSolutions()
        {
            var result = await _solutionsClient.GetAllSolutions();
            return Ok(result);
        }

        [HttpGet("{solutionId}")]
        [ProducesResponseType(typeof(Solution), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetSolutionData(long solutionId)
        {
            var result = await _solutionsClient.GetSolutionById(solutionId);
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }
        
        [HttpGet("taskSolution/{solutionId}")]
        [Authorize]
        [ProducesResponseType(typeof(Solution[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllStudentSolutions(long solutionId)
        {
            var studentId = Request.GetUserId();
            var result = await _solutionsClient.GetAllUserSolutions(solutionId, studentId);
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }
        
        [HttpPost("{taskId}")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostSolution(SolutionViewModel model, long taskId)
        {
            var result = await _solutionsClient.PostSolution(model, taskId);
            return Ok(result);
        }
        
        [HttpPost("rateSolution/{solutionId}/{newRating}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> RateSolution(long solutionId, int newRating)
        {
            await _solutionsClient.RateSolution(solutionId, newRating);
            return Ok();
        }
        
        [HttpPost("markSolutionFinal/{solutionId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> MarkSolution(long solutionId)
        {
            await _solutionsClient.MarkSolution(solutionId);
            return Ok();
        }
        
        [HttpDelete("delete/{solutionId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteSolution(long solutionId)
        {
            await _solutionsClient.DeleteSolution(solutionId);
            return Ok();
        }
    }
}
