using HwProj.AchievementService.API.Models;
using HwProj.Repositories;
using HwProj.Models.AchievementService;

namespace HwProj.AchievementService.API.Repositories
{
    public interface IAchievementsRepository : ICrudRepository<Achievement, long>
    {
    }
}