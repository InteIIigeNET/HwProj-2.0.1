using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Models.Statistics;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Roles;
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

        public StatisticsController(ISolutionsServiceClient solutionClient, IAuthServiceClient authServiceClient, 
            ICoursesServiceClient coursesServiceClient) :
            base(authServiceClient)
        {
            _solutionClient = solutionClient;
            _coursesClient = coursesServiceClient;
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
        
        [HttpGet("{courseId}/charts")]
        [Authorize(Policy = "CourseStatisticsPolicy")]
        [ProducesResponseType(typeof(StatisticsCourseAdvancedViewModel), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetChartStatistics(long courseId, [FromQuery] string token)
        {
            var course = await _coursesClient.GetCourseById(courseId);
            if (course == null) return Forbid();
            
            var lectureId = User.FindFirst("_creatorId").Value; // ??
            var statistics = await _solutionClient.GetCourseStatistics(courseId, lectureId);
            var studentIds = statistics.Select(t => t.StudentId).ToArray();
            var studentsData = await AuthServiceClient.GetAccountsData(studentIds);
            
            var students = statistics.Zip(studentsData, (stats, student) => new StatisticsCourseMatesModel
            {
                Id = student.UserId,
                Name = student.Name,
                Surname = student.Surname,
                Homeworks = stats.Homeworks
            }).OrderBy(t => t.Surname).ThenBy(t => t.Name);
            
            var statisticsMeasure = await _solutionClient.GetAdvancedStatistics(courseId);

            var result = new StatisticsCourseAdvancedViewModel
            {
                Course = new CoursePreview
                {
                    Id = course.Id,
                    Name = course.Name,
                    GroupName = course.GroupName,
                },
                Token = course.Token,
                Students = students.ToArray(),
                Homeworks = course.Homeworks,
                AverageStudentSolutions = statisticsMeasure.AverageStudentSolutions,
                BestStudentSolutions = statisticsMeasure.BestStudentSolutions
            };
            
            return Ok(result);
        }
    }
}
