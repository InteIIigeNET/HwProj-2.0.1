using System.Threading.Tasks;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Services;
using HwProj.Utils.Authorization;
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

        [HttpPost]
        public async Task<IActionResult> Get([FromBody] NotificationFilter filter, string userId)
        {
            await _notificationsService.GetAsync(userId, filter);
            return Ok();
        }

        [HttpPut("mark_as_seen")]
        public async Task<IActionResult> MarkNotifications([FromBody] long[] notificationIds)
        {
            var userId = Request.GetUserId();
            await _notificationsService.MarkAsSeenAsync(userId, notificationIds);
            return Ok();
        }
    }
}
