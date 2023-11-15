using HwProj.EventBus.Client;
using HwProj.Models.NotificationsService;
using Microsoft.EntityFrameworkCore;

namespace HwProj.NotificationsService.API.Models
{
    public sealed class NotificationsContext : DbContext
    {
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationsSetting> Settings { get; set; }
        public DbSet<ScheduleJob> ScheduleJobs { get; set; }

        public NotificationsContext(DbContextOptions options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<NotificationsSetting>().HasIndex(n => n.UserId);
            modelBuilder.Entity<NotificationsSetting>().HasKey(n => new { n.UserId, n.Category });
        }
    }
}
