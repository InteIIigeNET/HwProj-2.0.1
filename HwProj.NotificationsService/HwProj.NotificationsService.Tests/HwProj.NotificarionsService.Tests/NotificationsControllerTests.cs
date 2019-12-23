using HwProj.NotificationsService.API.Controllers;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using System;
using System.Threading.Tasks;

namespace HwProj.NotificarionsService.Tests
{
    public class NotificationsControllerTests
    {
        private Mock<INotificationsService> service;
        private NotificationsController controller;

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
                    Date = DateTime.Now.AddDays(i),
                    Id = i
                };
            }

            return notifications;
        }

        [SetUp]
        public void Setup()
        {
            service = new Mock<INotificationsService>();
            service.Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<NotificationFilter>())).Returns(Task.FromResult(GetTestsNotifications()));
            controller = new NotificationsController(service.Object);
        }

        [Test]
        public async Task GetNotificationsTest()
        {
            var filter = new NotificationFilter
            {
                HasSeen = false,
                Important = false,
                Owner = "current_user"
            };

            var result = await controller.Get(filter);
            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(200, okResult.StatusCode);
        }

        [Test]
        public async Task MarkNotificationsAsSeenTests()
        {
            var ids = new long[] { 1, 2, 3, 4 };
            var result = await controller.MarkNotificationsAsSeen(ids);
            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(200, okResult.StatusCode);
        }
    }
}