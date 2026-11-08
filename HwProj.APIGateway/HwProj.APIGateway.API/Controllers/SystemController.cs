using System;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Models;
using HwProj.AuthService.Client;
using HwProj.ContentService.Client;
using HwProj.CoursesService.Client;
using HwProj.NotificationsService.Client;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SystemController : AggregationController
{
    private readonly IContentServiceClient _contentServiceClient;
    private readonly ICoursesServiceClient _coursesServiceClient;
    private readonly INotificationsServiceClient _notificationsServiceClient;
    private readonly ISolutionsServiceClient _solutionsServiceClient;

    public SystemController(
        IAuthServiceClient authServiceClient,
        ICoursesServiceClient coursesServiceClient,
        INotificationsServiceClient notificationsServiceClient,
        ISolutionsServiceClient solutionsServiceClient,
        IContentServiceClient contentServiceClient) : base(authServiceClient)
    {
        _coursesServiceClient = coursesServiceClient;
        _notificationsServiceClient = notificationsServiceClient;
        _solutionsServiceClient = solutionsServiceClient;
        _contentServiceClient = contentServiceClient;
    }

    [HttpGet("status")]
    public async Task<SystemInfo[]> Status()
    {
        var authPing = AuthServiceClient.Ping();
        var coursesPing = _coursesServiceClient.Ping();
        var notificationsPing = _notificationsServiceClient.Ping();
        var solutionsPing = _solutionsServiceClient.Ping();
        var filesPing = _contentServiceClient.Ping();

        await Task.WhenAll(authPing, coursesPing, notificationsPing, solutionsPing, filesPing);

        return new[]
        {
            new SystemInfo
            {
                Service = "Auth Service",
                IsAvailable = authPing.Result
            },
            new SystemInfo
            {
                Service = "Courses Service",
                IsAvailable = coursesPing.Result
            },
            new SystemInfo
            {
                Service = "Notifications Service",
                IsAvailable = notificationsPing.Result
            },
            new SystemInfo
            {
                Service = "Solutions Service",
                IsAvailable = solutionsPing.Result
            },
            new SystemInfo
            {
                Service = "Content Service",
                IsAvailable = filesPing.Result
            }
        };
    }

    [HttpHead("ping/{service?}")]
    public async Task<IActionResult> Ping(string? service)
    {
        if (service == null) return Ok();

        Func<Task<bool>>? ping = service.ToLowerInvariant() switch
        {
            "auth" => AuthServiceClient.Ping,
            "courses" => _coursesServiceClient.Ping,
            "notifications" => _notificationsServiceClient.Ping,
            "solutions" => _solutionsServiceClient.Ping,
            "content" => _contentServiceClient.Ping,
            _ => null
        };

        if (ping == null) return NotFound();

        return await ping() ? Ok() : StatusCode(StatusCodes.Status503ServiceUnavailable);
    }
}
