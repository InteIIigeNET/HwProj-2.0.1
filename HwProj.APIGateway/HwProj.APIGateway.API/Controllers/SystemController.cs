using System.Threading.Tasks;
using HwProj.APIGateway.API.Models;
using HwProj.AuthService.Client;
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

        public SystemController(
            IAuthServiceClient authServiceClient,
            ICoursesServiceClient coursesServiceClient,
            INotificationsServiceClient notificationsServiceClient,
            ISolutionsServiceClient solutionsServiceClient) : base(authServiceClient)
        {
            _coursesServiceClient = coursesServiceClient;
            _notificationsServiceClient = notificationsServiceClient;
            _solutionsServiceClient = solutionsServiceClient;
        }

        [HttpGet("status")]
        public async Task<SystemInfo[]> Status()
        {
            var authPing = AuthServiceClient.Ping();
            var coursesPing = _coursesServiceClient.Ping();
            var notificationsPing = _notificationsServiceClient.Ping();
            var solutionsPing = _solutionsServiceClient.Ping();

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
            };
        }
    }
}
