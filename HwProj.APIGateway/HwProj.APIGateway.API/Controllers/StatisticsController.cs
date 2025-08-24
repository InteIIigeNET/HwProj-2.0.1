using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.ExportServices;
using HwProj.APIGateway.API.Models.Statistics;
using HwProj.APIGateway.API.TableGenerators;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Roles;
using HwProj.Models.Result;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : AggregationController
    {
        private readonly ISolutionsServiceClient _solutionClient;
        private readonly ICoursesServiceClient _coursesClient;
        private readonly GoogleService _googleService;

        public StatisticsController(
            ISolutionsServiceClient solutionClient,
            ICoursesServiceClient coursesServiceClient,
            IAuthServiceClient authServiceClient,
            GoogleService googleService)
            : base(authServiceClient)
        {
            _solutionClient = solutionClient;
            _coursesClient = coursesServiceClient;
            _googleService = googleService;
        }

        [HttpGet("{courseId}/lecturers")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(StatisticsLecturersModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetLecturersStatistics(long courseId)
        {
            var statistics = await _solutionClient.GetLecturersStatistics(courseId);
            if (statistics == null)
                return NotFound();

            var lecturers = await AuthServiceClient.GetAccountsData(statistics.Select(s => s.LecturerId).ToArray());

            var result = statistics.Zip(lecturers, (stat, lecturer) => new StatisticsLecturersModel
            {
                Lecturer = lecturer,
                NumberOfCheckedSolutions = stat.NumberOfCheckedSolutions,
                NumberOfCheckedUniqueSolutions = stat.NumberOfCheckedUniqueSolutions
            }).ToArray();

            return Ok(result);
        }

        [HttpGet("{courseId}")]
        [ProducesResponseType(typeof(StatisticsCourseMatesModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseStatistics(long courseId)
        {
            var result = await GetStatistics(courseId);
            if (result == null)
            {
                return Forbid();
            }

            return Ok(result);
        }

        private async Task<IOrderedEnumerable<StatisticsCourseMatesModel>?> GetStatistics(long courseId)
        {
            var statistics = await _solutionClient.GetCourseStatistics(courseId, UserId);
            if (statistics == null) return null;

            var studentIds = statistics.Select(t => t.StudentId).ToArray();
            var getStudentsTask = AuthServiceClient.GetAccountsData(studentIds);
            
            // Получаем пары <студент, закрепленные преподаватели (те, которые его явно в фильтре выбрали)>
            var mentorsToStudents = await _coursesClient.GetMentorsToAssignedStudents(courseId);
            var studentsToMentors = await GetStudentsToMentorsDictionary(mentorsToStudents);

            var result = statistics.Zip(
                await getStudentsTask,
                (stats, student) =>
                {
                    studentsToMentors.TryGetValue(student.UserId, out var reviewers);
                    return new StatisticsCourseMatesModel()
                    {
                        Id = student.UserId,
                        Name = student.Name,
                        Surname = student.Surname,
                        Reviewers = reviewers ?? Array.Empty<AccountDataDto>(),
                        Homeworks = stats.Homeworks
                    };
                }).OrderBy(t => t.Surname).ThenBy(t => t.Name);

            return result;
        }

        [HttpGet("{courseId}/charts")]
        [ProducesResponseType(typeof(AdvancedCourseStatisticsViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetChartStatistics(long courseId)
        {
            var course = await _coursesClient.GetCourseById(courseId);
            if (course == null)
                return Forbid();

            var statistics = await _solutionClient.GetCourseStatistics(courseId, UserId);
            var studentIds = statistics.Select(t => t.StudentId).ToArray();
            var studentsData = await AuthServiceClient.GetAccountsData(studentIds);

            var students = statistics.Zip(studentsData,
                (stats, student) => new StatisticsCourseMatesModel
            {
                Id = student.UserId,
                Name = student.Name,
                Surname = student.Surname,
                Homeworks = stats.Homeworks
            }).OrderBy(t => t.Surname).ThenBy(t => t.Name);
            
            var statisticsMeasure = await _solutionClient.GetBenchmarkStatistics(courseId);

            var result = new AdvancedCourseStatisticsViewModel
            {
                Course = new CoursePreview
                {
                    Id = course.Id,
                    Name = course.Name,
                    GroupName = course.GroupName,
                },
                StudentStatistics = students.ToArray(),
                Homeworks = course.Homeworks,
                AverageStudentSolutions = statisticsMeasure.AverageStudentSolutions,
                BestStudentSolutions = statisticsMeasure.BestStudentSolutions
            };

            return Ok(result);
        }

        /// <summary>
        /// Implements file download.
        /// </summary>
        /// <param name="courseId">The course Id the report is based on.</param>
        /// <param name="sheetName">Name of the sheet on which the report will be generated.</param>
        /// <returns>File download process.</returns>
        [HttpGet("getFile")]
        public async Task<IActionResult> GetFile(long courseId, string sheetName)
        {
            var course = await _coursesClient.GetCourseById(courseId);
            var statistics = await GetStatistics(courseId);
            if (statistics == null || course == null) return Forbid();

            var statisticStream =
                await ExcelGenerator.Generate(statistics.ToList(), course, sheetName).GetAsByteArrayAsync();
            return new FileContentResult(statisticStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }

        [HttpGet("getSheetTitles")]
        public async Task<Result<string[]>> GetSheetTitles(string sheetUrl)
            => await _googleService.GetSheetTitles(sheetUrl);

        [HttpPost("processLink")]
        public Result ProcessLink(string? sheetUrl)
        {
            if (sheetUrl == null) return Result.Failed("Некорректная ссылка");
            if (GoogleService.ParseLink(sheetUrl).Succeeded) return Result.Success();
            return Result.Failed("Некорректная ссылка");
        }

        /// <summary>
        /// Implements sending a report to the Google Sheets.
        /// </summary>
        /// <param name="courseId">The course Id the report is based on.</param>
        /// <param name="sheetUrl">Sheet Url parameter, required to make requests to the Google Sheets.</param>
        /// <param name="sheetName">Sheet Name parameter, required to make requests to the Google Sheets.</param>
        /// <returns>Operation status.</returns>
        [HttpGet("exportToSheet")]
        public async Task<Result> ExportToGoogleSheets(
            long courseId, string sheetUrl, string sheetName)
        {
            var course = await _coursesClient.GetCourseById(courseId);
            var statistics = await GetStatistics(courseId);
            if (course == null || statistics == null) return Result.Failed("Ошибка при получении статистики");
            var result = await _googleService.Export(course, statistics, sheetUrl, sheetName);
            return result;
        }

        private async Task<Dictionary<string, AccountDataDto[]>> GetStudentsToMentorsDictionary(
            MentorToAssignedStudentsDTO[] mentorsToStudents)
        {
            var mentorsIds = mentorsToStudents.Select(mts => mts.MentorId).ToArray();
            var mentorsAccountData = await AuthServiceClient.GetAccountsData(mentorsIds);
            var mentorIdToAccountData = mentorsAccountData
                .ToDictionary(
                    accountData => accountData.UserId,
                    accountData => accountData
                );

            return mentorsToStudents
                .SelectMany(m =>
                    m.SelectedStudentsIds.Select(studentId =>
                        new
                        {
                            StudentId = studentId,
                            Reviewer = mentorIdToAccountData[m.MentorId]
                        })
                )
                .GroupBy(sr => sr.StudentId)
                .ToDictionary(
                    groups => groups.Key,
                    groups => groups.Select(sr => sr.Reviewer)
                        .Distinct()
                        .ToArray()
                );
        }
    }
}
