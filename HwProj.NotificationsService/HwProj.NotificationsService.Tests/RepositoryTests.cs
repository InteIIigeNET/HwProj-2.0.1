using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System;
using System.Threading.Tasks;

namespace HwProj.NotificationsService.Tests
{
    [TestFixture]
    public class RepositoryTests
    {
        private NotificationsContext _notificationContext;
        private NotificationsRepository _notificationRepository;
        private INotificationsService _notificationService;

        [SetUp]
        public void Setup()
        {
            var connectionString = "Server=(localdb)\\mssqllocaldb;Database=NotificationServiceDB;Trusted_Connection=True;";
            var builder = new DbContextOptionsBuilder();
            var options = builder.UseSqlServer(connectionString).Options;
            _notificationContext = new NotificationsContext(options);
            _notificationRepository = new NotificationsRepository(_notificationContext);
            _notificationService = new API.Services.NotificationsService(_notificationRepository);
        }

        [Test]
        public async Task Test()
        {
            using (var transaction = _notificationContext.Database.BeginTransactionAsync())
            {
                var userId = "Student";
                var date = DateTime.Now;
                var random = new Random();
                const int notifcationCount = 100;
                for (var i = 0; i < notifcationCount; ++i)
                {

                    var notification = new Notification
                    {
                        Sender = "HomeworkService",
                        Owner = userId,
                        Category = "Tasks",
                        HasSeen = random.Next(0, 1) == 1 ? true : false,
                        Body = "Task1_was_added",
                        Date = date
                    };
                    date = date.AddDays(-1); 
                    await _notificationRepository.AddAsync(notification);
                }

                var notifications = await _notificationService.GetAsync(userId,
                    new NotificationFilter
                    {
                        MaxCount = 10,
                        HasSeen = true
                    }) ;

                Assert.That(notifications, Is.Ordered.Descending.By("Date"));

            }
        }

        [TearDown]
        public void Cleanup()
        { 
            _notificationContext.Dispose();
        }


    }
}
