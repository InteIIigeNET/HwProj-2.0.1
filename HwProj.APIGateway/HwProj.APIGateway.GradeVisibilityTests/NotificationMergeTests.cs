using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.AuthService.DTO;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.SolutionsService;
using HwProj.NotificationService.Events.SolutionsService;
using HwProj.NotificationsService.API.EventHandlers;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services.Digest;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;

namespace HwProj.APIGateway.GradeVisibilityTests;

public class NotificationMergeTests
{
    [TestCase(true, "student", true)]
    [TestCase(false, "student", false)]
    [TestCase(true, "mentor", false)]
    public async Task DigestRechecksVisibilityAfterNotificationWasCreated(bool hide, string recipient, bool expectedHidden)
    {
        var original = new DigestItem
        {
            Kind = DigestItemKind.SolutionRated, CourseId = 1, TaskId = 3,
            TaskTitle = "Task", Rating = 7, MaxRating = 10, PreviousRating = 5,
            Comment = "Improve naming\n| Критерий оценивания | Баллы |\n| --- | --- |\n| Code | 7 |"
        };
        var repository = new Mock<INotificationsRepository>();
        repository.Setup(r => r.GetDigestNotificationsAsync(It.IsAny<string[]>(), It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new[] { original.ToDigestOnlyNotification(recipient, "SolutionService", CategoryState.Homeworks) });
        var courses = new Mock<ICoursesServiceClient>();
        courses.Setup(c => c.GetCourseByTask(3)).ReturnsAsync(new CourseDTO
        {
            Id = 1, MentorIds = new[] { "mentor" },
            Homeworks = new[] { new HomeworkViewModel
            {
                HideRatings = hide, Tasks = new List<HomeworkTaskViewModel> { new HomeworkTaskViewModel { Id = 3 } }
            } }
        });
        var auth = new Mock<IAuthServiceClient>();
        auth.Setup(a => a.GetAccountData(recipient)).ReturnsAsync(
            new AccountDataDto(recipient, "Test", "User", "user@example.test", "Student", false));
        IReadOnlyList<DigestEmail> sent = null;
        var email = new Mock<IEmailService>();
        email.Setup(e => e.SendDigestsAsync(It.IsAny<IReadOnlyList<DigestEmail>>(), It.IsAny<CancellationToken>()))
            .Callback<IReadOnlyList<DigestEmail>, CancellationToken>((messages, _) => sent = messages)
            .ReturnsAsync((IReadOnlyList<DigestEmail> messages, CancellationToken _) => messages);
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = new DigestService(repository.Object, auth.Object, courses.Object, email.Object, cache,
            Options.Create(new DigestOptions()), new ConfigurationBuilder().Build(), NullLogger<DigestService>.Instance);

        var result = await service.SendRequestedDigestAsync(recipient);

        Assert.That(result.Succeeded, Is.True);
        var entry = sent.Single().Message.Sections.Single().Groups.Single().Entries.Single();
        Assert.That(entry.Badge, Is.EqualTo(expectedHidden ? "Проверено" : "7 / 10"));
        Assert.That(entry.Criteria.Count, Is.EqualTo(expectedHidden ? 0 : 1));
        Assert.That(entry.Quote, Is.EqualTo("Improve naming"));
        if (expectedHidden) Assert.That(entry.Hint, Is.Null);
    }

    [TestCase(true, false)]
    [TestCase(true, true)]
    [TestCase(false, false)]
    public async Task RedesignedNotificationAndDigestRespectHiddenScores(bool hidden, bool revision)
    {
        Notification saved = null;
        var repository = new Mock<INotificationsRepository>();
        repository.Setup(r => r.AddAsync(It.IsAny<Notification>()))
            .Callback<Notification>(n => saved = n).ReturnsAsync(1);
        var handler = new RateEventHandler(repository.Object, new ConfigurationBuilder().Build());
        await handler.HandleAsync(new RateEvent(
            new HomeworkTaskViewModel { Id = 3, Title = "Task", HideRatings = hidden, MaxRating = 10 },
            new SolutionViewModel
            {
                StudentId = "student", Rating = 7, RequiresRevision = revision,
                LecturerComment = "Improve naming\n| Критерий оценивания | Баллы |\n| --- | --- |\n| Code | 7 |"
            }, 1, "Course", 5));

        Assert.That(saved, Is.Not.Null);
        Assert.That(saved.Body.Contains("7 / 10"), Is.EqualTo(!hidden));
        Assert.That(saved.Body.Contains("5 / 10"), Is.EqualTo(!hidden));
        Assert.That(saved.Body.Contains("Improve naming"), Is.True);
        var item = DigestItem.FromNotification(saved);
        Assert.That(item.Rating, Is.EqualTo(hidden ? null : (int?)7));
        Assert.That(item.PreviousRating, Is.EqualTo(hidden ? null : (int?)5));
        Assert.That(item.IsRatingHidden, Is.EqualTo(hidden));
        Assert.That(item.RequiresRevision, Is.EqualTo(revision));
        Assert.That(item.Comment.Contains("| Code | 7 |"), Is.EqualTo(!hidden));
        var entry = DigestBuilder.Build(new[] { item }, DateTime.UtcNow, "https://example.test")
            .Sections.Single().Groups.Single().Entries.Single();
        Assert.That(entry.Badge, Is.EqualTo(hidden
            ? revision ? "Требуется отправить исправленное решение" : "Проверено"
            : "7 / 10"));
        Assert.That(entry.Criteria.Count, Is.EqualTo(hidden ? 0 : 1));
        if (hidden) Assert.That(entry.Hint, Is.Null);
    }
}
