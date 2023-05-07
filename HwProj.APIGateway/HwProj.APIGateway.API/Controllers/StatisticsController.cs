using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Models;
using HwProj.APIGateway.API.Models.Solutions;
using HwProj.AuthService.Client;
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

        public StatisticsController(ISolutionsServiceClient solutionClient, IAuthServiceClient authServiceClient) :
            base(authServiceClient)
        {
            _solutionClient = solutionClient;
        }

        [HttpGet("{courseId}")]
        [ProducesResponseType(typeof(StatisticsCourseMatesModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseStatistics(long courseId)
        {
            var statistics = await _solutionClient.GetCourseStatistics(courseId, UserId);
            if (statistics == null) return Forbid();

            var result = await GetStatisticsCourseMatesModels(statistics);
            return Ok(result);
        }

        private async Task<IOrderedEnumerable<StatisticsCourseMatesModel>> GetStatisticsCourseMatesModels(
            StatisticsCourseMatesDto[] statistics)
        {
            var studentIds = statistics.Select(t => t.StudentId).ToArray();
            var students = await AuthServiceClient.GetAccountsData(studentIds);

            return statistics.Zip(students, (stats, student) => new StatisticsCourseMatesModel
            {
                Id = student.UserId,
                Name = student.Name,
                Surname = student.Surname,
                Homeworks = stats.Homeworks
            }).OrderBy(t => t.Surname).ThenBy(t => t.Name);
        }
    }
}
