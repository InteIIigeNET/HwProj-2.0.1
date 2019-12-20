using HwProj.NotificationsService.API.Controllers;
using HwProj.NotificationsService.API.Services;
using NUnit.Framework;
using Moq;

namespace NotificationsService.Tests
{
    [TestFixture]
    public class NotificationsControllerTests
    {
        private NotificationsController controller;
        private Mock<INotificationsService> service;

        [SetUp]
        public void Setup()
        {
        }

        [Test]
        public void Test1()
        {
            Assert.Pass();
        }
    }
}