using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.Models.NotificationsService;
using HwProj.Models.Result;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.NotificationsService.API.Services.Digest;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.NotificationsService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationsRepository _repository;
        private readonly IDigestService _digestService;
        private readonly IMapper _mapper;

        public NotificationsController(INotificationsRepository repository, IDigestService digestService,
            IMapper mapper)
        {
            _repository = repository;
            _digestService = digestService;
            _mapper = mapper;
        }

        [HttpGet("get/{userId}")]
        [ProducesResponseType(typeof(CategorizedNotifications[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Get(string userId)
        {
            var notifications = await _repository.GetAllByUserAsync(userId);
            var notificationViewModels = _mapper.Map<NotificationViewModel[]>(notifications);
            var groupedNotifications = NotificationsDomain.Group(notificationViewModels);
            return Ok(groupedNotifications);
        }

        [HttpPut("markAsSeen/{userId}")]
        public async Task<IActionResult> MarkNotifications([FromBody] long[] notificationIds, string userId)
        {
            await _repository.MarkAsSeenAsync(userId, notificationIds);
            return Ok();
        }

        [HttpGet("new/{userId}")]
        public async Task<int> GetNewNotificationsCount(string userId)
        {
            var count = await _repository.GetNewCountAsync(userId);
            return count;
        }

        [HttpPost("digest/{userId}")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<Result> SendDigest(string userId) =>
            await _digestService.SendRequestedDigestAsync(userId);
    }
}
