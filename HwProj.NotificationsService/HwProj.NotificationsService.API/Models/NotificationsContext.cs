using Microsoft.EntityFrameworkCore;

namespace HwProj.NotificationsService.API.Models
{
    public sealed class NotificationsContext : DbContext
    {
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationsSetting> Settings { get; set; }

        public NotificationsContext(DbContextOptions options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<NotificationsSetting>().HasIndex(n => n.UserId);
            modelBuilder.Entity<NotificationsSetting>().HasKey(n => new { n.UserId, n.Category });

            // Дайжест выбирает уведомления за последние сутки. Старые уведомления без данных для дайжеста
            // в индекс не попадают, а получатель включён в него, чтобы список получателей строился по одному индексу
            modelBuilder.Entity<Notification>()
                .HasIndex(n => n.Date)
                .HasFilter("[DigestKind] IS NOT NULL")
                .IncludeProperties(n => n.Owner);
        }
    }
}
