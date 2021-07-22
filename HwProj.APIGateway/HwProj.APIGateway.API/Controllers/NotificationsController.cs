using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.Client;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Threading.Tasks;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/notifications")] //localhost:5000/api/notifications
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationsServiceClient _client;

        public NotificationsController(INotificationsServiceClient client)
        {
            _client = client;
        }

        [HttpGet("get")]
        [ProducesResponseType(typeof(Notification[]), (int)HttpStatusCode.OK)]
        public async Task<Notification[]> Get()
        {
            var userId = Request.GetUserId();
            var result = await _client.Get(userId);
            return result;
        }
    }
}
