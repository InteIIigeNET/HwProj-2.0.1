using HwProj.Models.AchievementService;
using Microsoft.EntityFrameworkCore;

namespace HwProj.AchievementService.API.Models
{
    public sealed class AchievementContext : DbContext
    {
        public DbSet<Achievement> Achievements { get; set; }
        
        public AchievementContext(DbContextOptions options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }
}