using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;
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
        public async Task<IActionResult> Get([FromBody] NotificationFilter filter)
        {
            var userId = Request.GetUserId();
            await _notificationsService.GetAllByUserAsync(userId, filter);
            return Ok();
        }

        [HttpPost("mark_as_seen")]
        public async Task<IActionResult> MarkAsSeen([FromBody] long[] notificationIds)
        {
            var userId = Request.GetUserId();
            await _notificationsService.MarkAsSeenAsync(userId, notificationIds);
            return Ok();
        }
    }
}
