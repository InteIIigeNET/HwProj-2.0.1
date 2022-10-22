using System;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Google.Apis.Sheets.v4;
using HwProj.APIGateway.API.Models;
using HwProj.AuthService.Client;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : AggregationController
    {
        private readonly ISolutionsServiceClient _solutionClient;
        private readonly SheetsService _sheetsService;

        public StatisticsController(ISolutionsServiceClient solutionClient, IAuthServiceClient authServiceClient,
            SheetsService sheetsService) :
            base(authServiceClient)
        {
            _solutionClient = solutionClient;
            _sheetsService = sheetsService;
        }

        [HttpGet("{courseId}")]
        [ProducesResponseType(typeof(StatisticsCourseMatesModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseStatistics(long courseId)
        {
            var statistics = await _solutionClient.GetCourseStatistics(courseId, UserId);
            if (statistics == null) return Forbid();

            var studentIds = statistics.Select(t => t.StudentId).ToArray();
            var students = await AuthServiceClient.GetAccountsData(studentIds);

            var result = statistics.Zip(students, (stats, student) => new StatisticsCourseMatesModel
            {
                Id = student.UserId,
                Name = student.Name,
                Surname = student.Surname,
                Homeworks = stats.Homeworks
            }).OrderBy(t => t.Surname).ThenBy(t => t.Name);

            return Ok(result);
        }

        public class SheetUrl
        {
            public string Url { get; set; }
        }

        [HttpPost("getSheetTitles")]
        public async Task<string[]> GetSheetTitles([FromBody] SheetUrl sheetUrl)
        {
            var match = Regex.Match(sheetUrl.Url, "https://docs\\.google\\.com/spreadsheets/d/(?<id>.+)/");
            if (!match.Success) return Array.Empty<string>();

            var spreadsheetId = match.Groups["id"].Value;
            var sheet = await _sheetsService.Spreadsheets.Get(spreadsheetId).ExecuteAsync();
            return sheet.Sheets.Select(t => t.Properties.Title).ToArray();
        }
    }
}
