using HwProj.AchievementService.API.Models;
using HwProj.Repositories;
using HwProj.Models.AchievementService;

namespace HwProj.AchievementService.API.Repositories
{
    public class AchievementsRepository : CrudRepository<Achievement, long>, IAchievementsRepository
    {
        public AchievementsRepository(AchievementContext context)
            : base(context)
        {
        }
    }
}