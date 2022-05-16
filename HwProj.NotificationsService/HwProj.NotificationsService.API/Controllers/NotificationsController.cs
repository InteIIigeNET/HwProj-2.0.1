using System.Net;
using System.Threading.Tasks;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.NotificationsService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationsDomain _notificationsService;
        private readonly INotificationsRepository _repository;

        public NotificationsController(NotificationsDomain notificationsService, INotificationsRepository repository)
        {
            _notificationsService = notificationsService;
            _repository = repository;
        }

        [HttpPost("get/{userId}")]
        [ProducesResponseType(typeof(CategorizedNotifications[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> Get(string userId)
        {
            var notifications = await _repository.GetAllByUserAsync(userId);
            var groupedNotifications = _notificationsService.Group(notifications);
            return Ok(groupedNotifications);
        }

        [HttpPut("markAsSeen/{userId}")]
        public async Task<IActionResult> MarkNotifications([FromBody] long[] notificationIds, string userId)
        {
            await _repository.MarkAsSeenAsync(userId, notificationIds);
            return Ok();
        }
    }
}