using HwProj.Models.NotificationsService;
using Microsoft.EntityFrameworkCore;

namespace HwProj.NotificationsService.API.Models
{
    public sealed class NotificationsContext : DbContext
    {
        public DbSet<Notification> Notifications { get; set; }

        public NotificationsContext(DbContextOptions options)
            : base(options)
        {
        }
    }
}