using System;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using NUnit.Framework;
using Moq;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.Tests
{
    [TestFixture]
    public class NotificationsServiceTests
    {
        private INotificationsService _notificationsService;

        private void CreateNotifications()
        {
            var notification = new Notification
            {
                Sender = "HomeworkService",
                Owner = "Student",
                Category = "Tasks",
                Date = DateTime.Now,
                HasSeen = false,
                Body = "Task1_was_added"
            };
        }

        [SetUp]
        public void Setup()
        {
            var mock = new Mock<INotificationsRepository>();
            _notificationsService = new API.Services.NotificationsService(mock.Object);
            mock.Setup(t => t.AddAsync(It.IsAny<Notification>())).Returns<Task<long>>(t => t);
            mock.Setup(t => t.GetAllByUserAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<Specification>())).Returns<Task<Notification[]>>(t => t);
        }

        [Test]
        public async Task DoesNotificationFilterWork()
        {
            var notification = new Notification
            {
                Sender = "HomeworkService",
                Owner = "Student",
                Category = "Tasks",
                Date = DateTime.Now,
                HasSeen = false,
                Body = "Task1_was_added"
            };

            await _notificationsService.AddNotificationAsync("63d729e2-1f30-45d5-a8f5-baa26603c99c", notification);
            NotificationFilter filter = null;
            var notifications = _notificationsService.GetAsync("63d729e2-1f30-45d5-a8f5-baa26603c99c", filter);
            Assert.AreEqual(1, notifications.Result.Length);
        }

        [Test]
    }
}