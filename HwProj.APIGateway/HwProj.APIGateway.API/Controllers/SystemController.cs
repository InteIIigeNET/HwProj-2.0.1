using System.Threading.Tasks;
using HwProj.APIGateway.API.Models;
using HwProj.AuthService.Client;
using HwProj.ContentService.Client;
using HwProj.CoursesService.Client;
using HwProj.NotificationsService.Client;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemController : AggregationController
    {
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly INotificationsServiceClient _notificationsServiceClient;
        private readonly ISolutionsServiceClient _solutionsServiceClient;
        private readonly IContentServiceClient _contentServiceClient;

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

            await Task.WhenAll(authPing, coursesPing, notificationsPing, solutionsPing);

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
                },
            };
        }
    }
}
