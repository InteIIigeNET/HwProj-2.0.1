using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Controllers;
using HwProj.APIGateway.API.Services;
using HwProj.APIGateway.API.Models.Statistics;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.StatisticsService;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.Client;
using HwProj.APIGateway.API.Models;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;

namespace HwProj.APIGateway.GradeVisibilityTests;

public class GradeVisibilityTests
{
    private static ControllerContext Viewer(string id) => new ControllerContext
    {
        HttpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("_id", id) }, "test"))
        }
    };

    private static CourseDTO Course(bool hide) => new CourseDTO
    {
        Id = 1, MentorIds = new[] { "mentor" },
        CourseMates = new[] { new CourseMateViewModel { StudentId = "student", IsAccepted = true } },
        Homeworks = new[] { new HomeworkViewModel
        {
            Id = 2, HideRatings = hide, Tasks = new List<HomeworkTaskViewModel> { new HomeworkTaskViewModel { Id = 3, MaxRating = 10 } }
        } }
    };

    [TestCase("student", true, true)]
    [TestCase("student", false, false)]
    [TestCase("mentor", true, false)]
    [TestCase("other-course-teacher", true, true)]
    public void PolicyDependsOnHomeworkAndCourseMembership(string viewer, bool setting, bool hidden)
    {
        Assert.That(GradeVisibility.HiddenTaskIds(Course(setting), viewer).Contains(3), Is.EqualTo(hidden));
    }

    [TestCase(SolutionState.Rated, false)]
    [TestCase(SolutionState.Final, true)]
    [TestCase(SolutionState.Posted, false)]
    public void HiddenResponseKeepsReviewInformationWithoutNumericScore(SolutionState state, bool revision)
    {
        var solution = new SolutionDto
        {
            Id = 4, TaskId = 3, Rating = 7, State = state, RequiresRevision = revision,
            LecturerComment = "Исправьте обработку ошибок.\n\n| Критерий оценивания | Баллы |\n| --- | --- |\n| Код | 7 / 10 |\n| Доп. оценка | 0 |"
        };
        GradeVisibility.Apply(solution, GradeVisibility.HiddenTaskIds(Course(true), "student"));
        var response = new GetSolutionModel(solution, null, null);
        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        using var document = JsonDocument.Parse(json);
        Assert.That(document.RootElement.GetProperty("rating").ValueKind, Is.EqualTo(JsonValueKind.Null));
        Assert.That(response.IsRatingHidden, Is.True);
        Assert.That(response.RequiresRevision, Is.EqualTo(revision));
        Assert.That(response.State, Is.EqualTo(state == SolutionState.Final ? SolutionState.Rated : state));
        Assert.That(response.LecturerComment, Is.EqualTo("Исправьте обработку ошибок."));
    }

    [Test]
    public void NestedStatisticsRedactsAllAttemptsOfHiddenTaskOnly()
    {
        var hidden = new SolutionDto { TaskId = 3, Rating = 8 };
        var visible = new SolutionDto { TaskId = 9, Rating = 6 };
        var rows = new[] { new StudentSolutionsTableDto { Homeworks = new List<StudentSolutionsTableHomeworkDto>
        {
            new StudentSolutionsTableHomeworkDto { Tasks = new List<StudentSolutionsTableTaskDto>
            {
                new StudentSolutionsTableTaskDto { Solutions = new List<SolutionDto> { hidden, visible } }
            } }
        } } };
        GradeVisibility.Apply(rows, new HashSet<long> { 3 });
        Assert.That(hidden.Rating, Is.Null);
        Assert.That(visible.Rating, Is.EqualTo(6));
    }

    [TestCase("student", true)]
    [TestCase("mentor", false)]
    public async Task StatisticsAndChartsApplyTheSamePrivacyRule(string viewer, bool hidden)
    {
        var course = Course(true);
        var courses = new Mock<ICoursesServiceClient>();
        courses.Setup(c => c.GetCourseById(1)).ReturnsAsync(course);
        courses.Setup(c => c.GetMentorsToAssignedStudents(1)).ReturnsAsync(Array.Empty<MentorToAssignedStudentsDTO>());
        var auth = new Mock<IAuthServiceClient>();
        auth.Setup(a => a.GetAccountsData(It.IsAny<string[]>())).ReturnsAsync(new[] { new AccountDataDto("student", "Test", "Student", "student@example.test", "Student", false) });
        var rows = new[] { new StudentSolutionsTableDto { StudentId = "student",
            Homeworks = new List<StudentSolutionsTableHomeworkDto> { new StudentSolutionsTableHomeworkDto
            {
                Id = 2, Tasks = new List<StudentSolutionsTableTaskDto> { new StudentSolutionsTableTaskDto
                {
                    Id = 3, Solutions = new List<SolutionDto> { new SolutionDto { Id = 4, TaskId = 3, Rating = 8 } }
                } }
            } }
        } };
        var solutions = new Mock<ISolutionsServiceClient>();
        solutions.Setup(s => s.GetCourseStatistics(1, viewer)).ReturnsAsync(rows);
        solutions.Setup(s => s.GetBenchmarkStatistics(1)).ReturnsAsync(new StatisticsCourseStudentsBenchmarkDTO
        {
            AverageStudentSolutions = new[] { new StatisticsCourseMeasureSolutionModel { TaskId = 3, Rating = 8 } },
            BestStudentSolutions = new[] { new StatisticsCourseMeasureSolutionModel { TaskId = 3, Rating = 10 } }
        });
        var controller = new StatisticsController(solutions.Object, auth.Object, courses.Object) { ControllerContext = Viewer(viewer) };
        var statsResult = await controller.GetCourseStatistics(1);
        Assert.That(statsResult, Is.TypeOf<OkObjectResult>());
        Assert.That(rows[0].Homeworks[0].Tasks[0].Solutions[0].Rating, Is.EqualTo(hidden ? null : (int?)8));
        var chartResult = (OkObjectResult)await controller.GetChartStatistics(1);
        var chart = (AdvancedCourseStatisticsViewModel)chartResult.Value;
        Assert.That(chart.AverageStudentSolutions.Length, Is.EqualTo(hidden ? 0 : 1));
        Assert.That(chart.BestStudentSolutions.Length, Is.EqualTo(hidden ? 0 : 1));
        Assert.That(chart.HiddenTaskIds.Length, Is.EqualTo(hidden ? 1 : 0));
    }

    [TestCase("student", true)]
    [TestCase("mentor", false)]
    public async Task AchievementDoesNotDiscloseTheHiddenScore(string viewer, bool hidden)
    {
        var courses = new Mock<ICoursesServiceClient>();
        courses.Setup(c => c.GetCourseByTask(3)).ReturnsAsync(Course(true));
        var solutions = new Mock<ISolutionsServiceClient>();
        solutions.Setup(s => s.GetTaskSolutionStatistics(1, 3)).ReturnsAsync(new[] { new StudentSolutionsDto
        {
            StudentId = "student", Solutions = new[] { new SolutionDto
            {
                Id = 4, TaskId = 3, StudentId = "student", Rating = 7, State = SolutionState.Rated
            } }
        } });
        var controller = new SolutionsController(solutions.Object, Mock.Of<IAuthServiceClient>(), courses.Object)
            { ControllerContext = Viewer(viewer) };
        var response = (OkObjectResult)await controller.GetSolutionAchievement(3, 4);
        Assert.That(response.Value == null, Is.EqualTo(hidden));
    }

    [TestCase("student", true)]
    [TestCase("mentor", false)]
    public async Task DeadlineResponseDoesNotBypassPrivacy(string viewer, bool hidden)
    {
        var courses = new Mock<ICoursesServiceClient>();
        courses.Setup(c => c.GetCourseByTask(3)).ReturnsAsync(Course(true));
        courses.Setup(c => c.GetTaskDeadlines()).ReturnsAsync(new[] { new TaskDeadlineDto
        {
            TaskId = 3, CourseId = 1, MaxRating = 10, DeadlineDate = DateTime.UtcNow.AddDays(1)
        } });
        var auth = new Mock<IAuthServiceClient>();
        auth.Setup(a => a.GetAccountData(viewer)).ReturnsAsync(new AccountDataDto(viewer, "Test", "User", "user@example.test", "Student", false));
        var solutions = new Mock<ISolutionsServiceClient>();
        solutions.Setup(s => s.GetLastTaskSolutions(It.IsAny<long[]>(), viewer)).ReturnsAsync(new[]
        {
            new SolutionDto { Id = 4, TaskId = 3, Rating = 7, State = SolutionState.Rated, RequiresRevision = true }
        });
        var controller = new AccountController(auth.Object, courses.Object, solutions.Object) { ControllerContext = Viewer(viewer) };
        var response = (UserDataDto)((OkObjectResult)await controller.GetUserData()).Value;
        Assert.That(response.TaskDeadlines[0].Rating, Is.EqualTo(hidden ? null : (long?)7));
        Assert.That(response.TaskDeadlines[0].IsRatingHidden, Is.EqualTo(hidden));
        Assert.That(response.TaskDeadlines[0].RequiresRevision, Is.True);
    }

    [TestCase("student", true)]
    [TestCase("mentor", false)]
    [TestCase("student", true, true)]
    [TestCase("mentor", false, true)]
    public async Task ExistingNotificationCannotRevealPreviouslyStoredScore(string viewer, bool hidden, bool redesigned = false)
    {
        var courses = new Mock<ICoursesServiceClient>();
        courses.Setup(c => c.GetCourseByTask(3)).ReturnsAsync(Course(true));
        var note = new NotificationViewModel
        {
            Sender = "SolutionService",
            Body = redesigned
                ? "<b>Оценка обновлена</b><br/>Задача <a href='/courses/1/homeworks?taskId=3'>Задача</a><br/>Оценка: 7/10\n| Код | 7 |"
                : "Задача <a href='/courses/1/homeworks?taskId=3'>Задача</a> оценена на <b>7/10</b>.\n| Критерий оценивания | Баллы |\n| Код | 7 |"
        };
        var notifications = new Mock<INotificationsServiceClient>();
        notifications.Setup(n => n.Get(viewer)).ReturnsAsync(new[] { new CategorizedNotifications
        {
            SeenNotifications = new[] { note }, NotSeenNotifications = Array.Empty<NotificationViewModel>()
        } });
        var controller = new NotificationsController(notifications.Object, courses.Object) { ControllerContext = Viewer(viewer) };
        await controller.Get();
        Assert.That(note.Body.Contains("7/10"), Is.EqualTo(!hidden));
        Assert.That(note.Body.Contains("| Код | 7 |"), Is.EqualTo(!hidden));
    }

    [TestCase("student", false)]
    [TestCase("mentor", false)]
    [TestCase("other-course-teacher", true)]
    public async Task DirectSolutionEndpointCannotBypassPolicy(string viewer, bool forbidden)
    {
        var courses = new Mock<ICoursesServiceClient>();
        courses.Setup(c => c.GetCourseByTask(3)).ReturnsAsync(Course(true));
        var solutions = new Mock<ISolutionsServiceClient>();
        solutions.Setup(c => c.GetSolutionById(4)).ReturnsAsync(new SolutionDto
        {
            Id = 4, TaskId = 3, StudentId = "student", Rating = 7, State = SolutionState.Rated
        });
        var controller = new SolutionsController(solutions.Object, Mock.Of<IAuthServiceClient>(), courses.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("_id", viewer) }, "test"))
            } }
        };
        var result = await controller.GetSolutionById(4);
        if (forbidden) Assert.That(result, Is.TypeOf<ForbidResult>());
        else
        {
            var returned = (SolutionDto)((OkObjectResult)result).Value;
            Assert.That(returned.Rating, Is.EqualTo(viewer == "mentor" ? (int?)7 : null));
        }
    }
}
