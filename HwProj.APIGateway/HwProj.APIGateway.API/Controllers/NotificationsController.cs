using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.Client;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Threading.Tasks;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationsServiceClient _client;

        public NotificationsController(INotificationsServiceClient client)
        {
            _client = client;
        }

        [HttpGet("get")]
        [ProducesResponseType(typeof(CategorizedNotifications[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> Get()
        {
            var userId = Request.GetUserId();
            var result = await _client.Get(userId, new NotificationFilter());
            return Ok(result);
        }

        [HttpPut("markAsSeen")]
        public async Task<IActionResult> MarkAsSeen([FromBody] long[] notificationIds)
        {
            var userId = Request.GetUserId();
            await _client.MarkAsSeen(userId, notificationIds);
            return Ok();
        }
    }
}