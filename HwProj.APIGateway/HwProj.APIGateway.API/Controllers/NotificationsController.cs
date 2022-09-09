using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.Client;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Threading.Tasks;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : AggregationController
    {
        private readonly INotificationsServiceClient _client;

        public NotificationsController(INotificationsServiceClient client) : base(null)
        {
            _client = client;
        }

        [HttpGet("get")]
        [ProducesResponseType(typeof(CategorizedNotifications[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Get()
        {
            var result = await _client.Get(UserId, new NotificationFilter());
            return Ok(result);
        }

        [HttpPut("markAsSeen")]
        public async Task<IActionResult> MarkAsSeen([FromBody] long[] notificationIds)
        {
            await _client.MarkAsSeen(UserId, notificationIds);
            return Ok();
        }
    }
}
