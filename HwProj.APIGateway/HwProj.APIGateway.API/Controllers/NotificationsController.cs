using System;
using System.Net;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using HwProj.CoursesService.Client;
using HwProj.APIGateway.API.Services;
using HwProj.Models.NotificationsService;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using HwProj.NotificationsService.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers;

[Route("api/[controller]")]
[Authorize]
[ApiController]
public class NotificationsController : AggregationController
{
    private readonly INotificationsServiceClient _notificationsClient;
    private readonly ICoursesServiceClient _coursesClient;

    public NotificationsController(INotificationsServiceClient notificationsClient, ICoursesServiceClient coursesClient) : base(null)
    {
        _notificationsClient = notificationsClient;
        _coursesClient = coursesClient;
    }

    [HttpGet("getNewNotificationsCount")]
    public async Task<int> GetNewNotificationsCount()
    {
        var count = await _notificationsClient.GetNewNotificationsCount(UserId);
        return count;
    }

    [HttpGet("get")]
    [ProducesResponseType(typeof(CategorizedNotifications[]), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> Get()
    {
        var result = await _notificationsClient.Get(UserId);
        var hiddenTasks = new Dictionary<long, bool>();
        foreach (var notification in result.SelectMany(c => c.SeenNotifications.Concat(c.NotSeenNotifications)))
        {
            var body = notification.Body ?? "";
            // Старые уведомления могли сохранить оценку до включения скрытия.
            if (!body.Contains("оценена на") &&
                !(notification.Sender == "SolutionService" &&
                  (body.Contains("Решение проверено") || body.Contains("Оценка обновлена")))) continue;
            var match = Regex.Match(body, @"taskId=(\d+)");
            if (!match.Success || !long.TryParse(match.Groups[1].Value, out var taskId)) continue;
            if (!hiddenTasks.TryGetValue(taskId, out var hidden))
            {
                var course = await _coursesClient.GetCourseByTask(taskId);
                hidden = course == null || GradeVisibility.HiddenTaskIds(course, UserId).Contains(taskId);
                hiddenTasks[taskId] = hidden;
            }
            if (hidden)
            {
                var endOfLink = body.IndexOf("</a>", StringComparison.Ordinal);
                notification.Body = endOfLink >= 0
                    ? body.Substring(0, endOfLink + 4) + " проверена. Результат доступен на странице решения."
                    : "Решение проверено. Результат доступен на странице решения.";
            }
        }
        return Ok(result);
    }

    [HttpPut("markAsSeen")]
    public async Task<IActionResult> MarkAsSeen([FromBody] long[] notificationIds)
    {
        await _notificationsClient.MarkAsSeen(UserId, notificationIds);
        return Ok();
    }

    [HttpGet("settings")]
    [Authorize]
    [ProducesResponseType(typeof(NotificationsSettingDto[]), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetSettings()
    {
        var isLecturer = User.IsInRole(Roles.LecturerRole);
        if (!isLecturer) return Ok(Array.Empty<NotificationsSettingDto>());

        var settings = await _notificationsClient.GetSettings(UserId);
        return Ok(settings);
    }

    [HttpPut("settings")]
    [Authorize]
    public async Task<IActionResult> ChangeSetting(NotificationsSettingDto newSetting)
    {
        await _notificationsClient.ChangeSetting(UserId, newSetting);
        return Ok();
    }

    [HttpPost("digest")]
    [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> SendDigest()
    {
        var result = await _notificationsClient.SendDigest(UserId);
        return Ok(result);
    }
}
