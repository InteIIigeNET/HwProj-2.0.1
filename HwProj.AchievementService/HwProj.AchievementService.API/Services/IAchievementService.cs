using System.Threading.Tasks;
using HwProj.Models.AchievementService;

namespace HwProj.AchievementService.API.Services
{
    public interface IAchievementService
    {
        Task<Achievement> GetAchievementAsync(long achievementId);
        Task<long> AddAchievementAsync(long taskId, Achievement achievement);
        Task DeleteAchievementAsync(long achievementId);
    }
}