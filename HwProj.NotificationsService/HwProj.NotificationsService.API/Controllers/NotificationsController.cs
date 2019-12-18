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

        [HttpGet("get_notifications")]
        public async Task<IActionResult> Get([FromQuery] NotificationFilter filter)
        {
            var userId = Request.GetUserId();
            var notifications = await _notificationsService.GetAsync(userId, filter);
            return Ok(notifications);
        }

        [HttpPut("mark_as_seen")]
        public async Task<IActionResult> MarkNotificationsAsSeen([FromBody] long[] notificationIds)
        {
            var userId = Request.GetUserId();
            await _notificationsService.MarkAsSeenAsync(userId, notificationIds);
            return Ok();
        }

        [HttpPut("mark_as_improtant")]
        public async Task<IActionResult> MarkNotificationsAsImportant([FromBody] long[] notificationsIds)
        {
            var userId = Request.GetUserId();
            await _notificationsService.MarkAsImportantAsync(userId, notificationsIds);
            return Ok();
        }

        [HttpPut("get_ntofications_in_time")]
        public async Task<IActionResult> GetInTime([FromQuery] int timeSpan)
        {
            var userId = Request.GetUserId();
            await _notificationsService.GetInTimeAsync(userId, timeSpan);
            return Ok();
        }
    }
}
