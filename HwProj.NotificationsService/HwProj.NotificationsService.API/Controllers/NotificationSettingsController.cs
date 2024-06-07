using System.Threading.Tasks;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.NotificationsService.API.Controllers
{
    [Route("api/[controller]/{userId}")]
    [ApiController]
    public class NotificationSettingsController : ControllerBase
    {
        private readonly INotificationSettingsRepository _settingsRepository;

        public NotificationSettingsController(INotificationSettingsRepository settingsRepository)
        {
            _settingsRepository = settingsRepository;
        }

        [HttpGet]
        public async Task<IActionResult> Get(string userId)
        {
            var settings = await _settingsRepository.GetAsync(userId, "newSolutions");
            var settingDtos = new[]
            {
                new NotificationsSettingDto
                {
                    Category = settings!.Category,
                    IsEnabled = settings.IsEnabled
                }
            };
            return Ok(settingDtos);
        }

        [HttpPut]
        public async Task<IActionResult> Change(string userId, [FromBody] NotificationsSettingDto newSettingDto)
        {
            await _settingsRepository.ChangeAsync(userId, newSettingDto.Category, newSettingDto.IsEnabled);
            return Ok();
        }
    }
}
