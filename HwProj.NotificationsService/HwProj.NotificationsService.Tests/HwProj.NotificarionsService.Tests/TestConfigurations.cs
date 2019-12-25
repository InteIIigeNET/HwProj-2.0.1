using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HwProj.NotificationsService.Tests
{
    public class TestConfigurations
    {
        public DbContextOptions GetConnectionToDB()
        {
            var connectionString = "Server=(localdb)\\mssqllocaldb;Database=NotificationServiceDB;Trusted_Connection=True;";
            var dbBuilder = new DbContextOptionsBuilder();
            var options = dbBuilder.UseSqlServer(connectionString).Options;
            return options;
        }
    }
}
