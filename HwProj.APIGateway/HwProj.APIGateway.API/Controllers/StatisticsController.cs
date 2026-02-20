using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Models.Statistics;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Roles;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StatisticsController : AggregationController
{
    private readonly ICoursesServiceClient _coursesClient;
    private readonly ISolutionsServiceClient _solutionClient;

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
        var getStudentsTask = AuthServiceClient.GetAccountsData(studentIds);

        // Получаем пары <студент, закрепленные преподаватели (те, которые его явно в фильтре выбрали)>
        var mentorsToStudents = await _coursesClient.GetMentorsToAssignedStudents(courseId);
        var studentsToMentors = await GetStudentsToMentorsDictionary(mentorsToStudents);

        var result = statistics.Zip(
            await getStudentsTask,
            (stats, student) =>
            {
                studentsToMentors.TryGetValue(student.UserId, out var reviewers);
                return new StatisticsCourseMatesModel
                {
                    Id = student.UserId,
                    Name = student.Name,
                    Surname = student.Surname,
                    Reviewers = reviewers ?? Array.Empty<AccountDataDto>(),
                    Homeworks = stats.Homeworks
                };
            }).OrderBy(t => t.Surname).ThenBy(t => t.Name);

        return Ok(result);
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
                GroupName = course.GroupName
            },
            StudentStatistics = students.ToArray(),
            Homeworks = course.Homeworks,
            AverageStudentSolutions = statisticsMeasure.AverageStudentSolutions,
            BestStudentSolutions = statisticsMeasure.BestStudentSolutions
        };

        return Ok(result);
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
