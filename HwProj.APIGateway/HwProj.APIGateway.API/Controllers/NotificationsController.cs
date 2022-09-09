using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.Client;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class NotificationsController : AggregationController
    {
        private readonly INotificationsServiceClient _notificationsClient;

        public NotificationsController(INotificationsServiceClient notificationsClient) : base(null)
        {
            _notificationsClient = notificationsClient;
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
            return Ok(result);
        }

        [HttpPut("markAsSeen")]
        public async Task<IActionResult> MarkAsSeen([FromBody] long[] notificationIds)
        {
            await _notificationsClient.MarkAsSeen(UserId, notificationIds);
            return Ok();
        }
    }
}
