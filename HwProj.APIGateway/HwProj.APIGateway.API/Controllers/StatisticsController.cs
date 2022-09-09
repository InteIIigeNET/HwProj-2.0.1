using System.Net;
using System.Threading.Tasks;
using HwProj.Models.StatisticsService;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : AggregationController
    {
        private readonly ISolutionsServiceClient _solutionClient;

        public StatisticsController(ISolutionsServiceClient solutionClient) : base(null)
        {
            _solutionClient = solutionClient;
        }

        [HttpGet("{courseId}")]
        [ProducesResponseType(typeof(StatisticsCourseMatesModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseStatistics(long courseId)
        {
            var result = await _solutionClient.GetCourseStatistics(courseId, UserId);
            return result == null
                ? Forbid() as IActionResult
                : Ok(result);
        }
    }
}
