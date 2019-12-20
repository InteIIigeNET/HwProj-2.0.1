using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

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