using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using System.Data;

namespace HwProj.NotificationsService.API.Models
{
    public sealed class NotificationsContext : DbContext
    {
        public DbSet<Notification> Notifications { get; set; }

        public NotificationsContext(DbContextOptions options)
            : base(options)
        {
            Database.EnsureCreated();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Notification>()
                .HasIndex(b => b.Date);
        }
    }
}