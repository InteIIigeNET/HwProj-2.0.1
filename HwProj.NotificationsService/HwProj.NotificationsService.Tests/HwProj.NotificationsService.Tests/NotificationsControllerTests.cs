using Microsoft.AspNetCore.Mvc;
using Xunit;
using Moq;
using HwProj.NotificationsService.API.Services;
using HwProj.NotificationsService.API.Controllers;
using HwProj.NotificationsService.API.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace HwProj.NotificationsService.Tests
{
    public class NotificationsControllerTests
    {
        private NotificationsController controller;
        private Mock<INotificationsService> service;

        [Fact]
        public async Task GetNotificationsTest()
        {
            service = new Mock<INotificationsService>();
            var notifications = FakeData.GetGenericNotifications(100);
            service.Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<NotificationFilter>())).Returns(notifications);
            controller = new NotificationsController(service.Object);
            var filter = new NotificationFilter
            {
                HasSeen = false,
                Important = true,
            };
            var result = await controller.Get(filter);
            var viewResult = Assert.IsAssignableFrom<IActionResult>(result);
        }
    }
}
