using System.Net;
using System.Threading.Tasks;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.NotificationsService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationsService _notificationsService;

        public NotificationsController(INotificationsService notificationsService)
        {
            _notificationsService = notificationsService;
        }

        [HttpPost("get/{userId}")]
        [ProducesResponseType(typeof(NotificationViewModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Get(string userId, [FromBody] NotificationFilter filter)
        {
            var notifications = await _notificationsService.GetAsync(userId, filter);
            return Ok(notifications ?? new NotificationViewModel[] { });
        }

        [HttpPut("markAsSeen/{userId}")]
        public async Task<IActionResult> MarkNotifications([FromBody] long[] notificationIds, string userId)
        {
            await _notificationsService.MarkAsSeenAsync(userId, notificationIds);
            return Ok();
        }
    }
}
