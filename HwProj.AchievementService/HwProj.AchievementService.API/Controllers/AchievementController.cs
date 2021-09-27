using System.Threading.Tasks;
using AutoMapper;
using HwProj.AchievementService.API.Models;
using HwProj.AchievementService.API.Services;
using HwProj.Models.AchievementService;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.AchievementService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AchievementsController : Controller
    {
        private readonly IAchievementService _achievementService;
        private readonly IMapper _mapper;

        public AchievementsController(IAchievementService achievementService, IMapper mapper)
        {
            _achievementService = achievementService;
            _mapper = mapper;
        }

        [HttpGet("get/{achievementId}")]
        public async Task<IActionResult> GetAchievement(long achievementId)
        {
            var achievement = await _achievementService.GetAchievementAsync(achievementId);

            return achievement == null
                ? NotFound()
                : Ok(achievement) as IActionResult;
        }
        
        [HttpPost("{taskId}/add")]
        public async Task<long> AddAchievement(long taskId, [FromBody] AchievementViewModel achievementViewModel)
        {
            var achievement = _mapper.Map<Achievement>(achievementViewModel);
            var achievementId = await _achievementService.AddAchievementAsync(taskId, achievement);
            return achievementId;
        }
        
        [HttpDelete("delete/{achievementId}")]
        public async Task DeleteTask(long achievementId)
        {
            await _achievementService.DeleteAchievementAsync(achievementId);
        }
    }
}