using Microsoft.EntityFrameworkCore;

namespace HwProj.NotificationsService.API.Models
{
	public sealed class NotificationsContext : DbContext
	{
		public NotificationsContext(DbContextOptions options)
			: base(options)
		{
			Database.EnsureCreated();
		}

		public DbSet<Notification> Notifications { get; set; }
	}
}