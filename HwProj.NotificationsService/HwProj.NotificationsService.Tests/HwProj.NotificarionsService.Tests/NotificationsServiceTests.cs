using System;
using NUnit.Framework;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Models;
using System.Threading.Tasks;

namespace HwProj.NotificationsService.Tests
{
    [TestFixture]
    public class NotificationsServiceTests
    {
        private NotificationsRepository _repository;
        private API.Services.NotificationsService _service;
        private TestConfigurations _configurations;
        private NotificationsContext _context;

        private Notification[] GetTestsNotifications()
        {
            var notifications = new Notification[100];
            for (var i = 0; i < 100; ++i)
            {
                notifications[i] = new Notification
                {
                    HasSeen = false,
                    Important = false,
                    Owner = "current_user",
                    Date = DateTime.Now.AddDays(i)
                };
            }

            return notifications;
        }

        [SetUp]
        public void SetUp()
        {
            _configurations = new TestConfigurations();
            _context = new NotificationsContext(_configurations.GetConnectionToDB());
            _repository = new NotificationsRepository(_context);
            _service = new API.Services.NotificationsService(_repository);
        }

        [Test]
        public async Task GetOneNotificationTest()
        {
            using (var transaction = _context.Database.BeginTransaction())
            {
                var notification = new Notification
                {
                    Owner = "user"
                };
                await _repository.AddAsync(notification);
                var notifications = await _service.GetAsync("user", new NotificationFilter 
                { 
                    Owner = "user" 
                }).ConfigureAwait(false);
                Assert.AreEqual(1, notifications.Length);
                Assert.AreSame(notification, notifications[0]);
            }
        }

        [Test]
        public async Task MarkAsImportantNotificationTest()
        {
            using (var transaction = _context.Database.BeginTransaction())
            {
                var notifications = GetTestsNotifications();
                var ids = new long[100];
                for (var i = 0; i < 100; ++i)
                {
                    ids[i] = await _repository.AddAsync(notifications[i]);
                }

                await _service.MarkAsImportantAsync("current_user", ids);
                var resultNotifications = await _service.GetAsync("current_user", new NotificationFilter 
                { 
                    Owner = "current_user", 
                    Important = true 
                }).ConfigureAwait(false);
                Assert.AreEqual(100, resultNotifications.Length);
                for (var i = 0; i < 100; ++i)
                {
                    Assert.IsTrue(resultNotifications[i].Important);
                }
            }
        }

        [Test]
        public async Task MarkAsSeenNotificationTest()
        {
            using (var transaction = _context.Database.BeginTransaction())
            {
                var notifications = GetTestsNotifications();
                var ids = new long[100];
                for (var i = 0; i < 100; ++i)
                {
                    ids[i] = await _repository.AddAsync(notifications[i]);
                }
                   
                await _service.MarkAsSeenAsync("current_user", ids);
                var resultNotifications = await _service.GetAsync("current_user", new NotificationFilter { Owner = "current_user", HasSeen = true }).ConfigureAwait(false);
                Assert.AreEqual(100, resultNotifications.Length);
                for (var i = 0; i < 100; ++i)
                {
                    Assert.IsTrue(resultNotifications[i].HasSeen);
                }
            }
        }

        [Test]
        public async Task GetInTimeNotifications()
        {
            using (var transaction = _context.Database.BeginTransaction())
            {
                
            }
        }
    }
}
