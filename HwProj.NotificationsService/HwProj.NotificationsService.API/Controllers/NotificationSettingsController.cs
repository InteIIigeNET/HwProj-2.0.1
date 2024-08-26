using System.Threading.Tasks;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.NotificationsService.API.Controllers
{
    [Route("api/[controller]/{userId}")]
    [ApiController]
    public class NotificationSettingsController : ControllerBase
    {
        private readonly INotificationSettingsService _settingsService;

        public NotificationSettingsController(INotificationSettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        [HttpGet]
        public async Task<IActionResult> Get(string userId)
        {
            var settings = await _settingsService.GetAsync(userId, "newSolutions");
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
            await _settingsService.ChangeAsync(userId, newSettingDto.Category, newSettingDto.IsEnabled);
            return Ok();
        }
    }
}
