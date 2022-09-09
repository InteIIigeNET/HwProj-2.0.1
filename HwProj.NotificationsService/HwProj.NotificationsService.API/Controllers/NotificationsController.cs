using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HwProj.NotificationsService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationsRepository _repository;
        private readonly IMapper _mapper;

        public NotificationsController(INotificationsRepository repository, IMapper mapper)
        {
            _repository = repository;
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
            var count = await _repository.FindAll(t => t.Owner == userId && !t.HasSeen).CountAsync();
            return count;
        }
    }
}
