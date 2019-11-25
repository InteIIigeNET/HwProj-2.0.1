using System.Collections.Generic;
using System.Threading.Tasks;
using System.Xml.Schema;
using AutoMapper;
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
        private readonly IMapper _mapper;

        public NotificationsController(INotificationsService notificationsService, IMapper mapper)
        {
            _notificationsService = notificationsService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] NotificationFilter filter)
        {
            var userId = Request.GetUserId();
            var notifications = await _notificationsService.GetAsync(userId, filter);
            return Ok(notifications);
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
