using System;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.Models.AuthService.ViewModels;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using AutoFixture;
using FluentAssertions;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.Client;
using Microsoft.AspNetCore.Http;

namespace HwProj.NotificationsService.IntegrationTests
{
    [TestFixture]
    public class Tests
    {
        private AuthServiceClient CreateAuthServiceClient()
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration
                .Setup(x => x.GetSection("Services")["Auth"])
                .Returns("http://localhost:5001");
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory
                .Setup(x => x.CreateClient(Options.DefaultName))
                .Returns(new HttpClient());
            return new AuthServiceClient(mockClientFactory.Object, mockIConfiguration.Object);
        }
        
        private NotificationsServiceClient CreateNotificationsServiceClient()
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration
                .Setup(x => x.GetSection("Services")["Notifications"])
                .Returns("http://localhost:5006");
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory
                .Setup(x => x.CreateClient(Options.DefaultName))
                .Returns(new HttpClient());
            return new NotificationsServiceClient(mockClientFactory.Object, mockIConfiguration.Object);
        }
        
        private CoursesServiceClient CreateCourseServiceClient(string userId)
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration
                .Setup(x => x.GetSection("Services")["Courses"])
                .Returns("http://localhost:5002");
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory
                .Setup(x => x.CreateClient(Options.DefaultName))
                .Returns(new HttpClient());
            var mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            mockHttpContextAccessor
                .Setup(x => x.HttpContext.User.FindFirst("_id"))
                .Returns(new Claim("", userId));
            return new CoursesServiceClient(mockClientFactory.Object, mockHttpContextAccessor.Object,
                mockIConfiguration.Object);
        }
        
        private RegisterViewModel GenerateRegisterViewModel()
        {
            var password = new Fixture().Create<string>();
            var fixture = new Fixture().Build<RegisterViewModel>()
                .With(vm => vm.Password, password)
                .With(vm => vm.PasswordConfirm, password);
            var viewModel = fixture.Create();
            viewModel.Email += "@mail.ru";
            return viewModel;
        }
        
        private CreateCourseViewModel GenerateCreateCourseViewModel()
            => new Fixture().Build<CreateCourseViewModel>()
                .With(c => c.IsOpen, true).Create();

        private async Task<(string, string)> CreateAndRegisterUser()
        {
            var authClient = CreateAuthServiceClient();
            var userData = GenerateRegisterViewModel();
            await authClient.Register(userData);
            var userId = await authClient.FindByEmailAsync(userData.Email);
            return (userId, userData.Email);
        }
            private async Task<(string, string)> CreateAndRegisterLecture()
        {
            var (userId, mail) = await CreateAndRegisterUser();
            var authClient = CreateAuthServiceClient();
            await authClient.InviteNewLecturer(new InviteLecturerViewModel() {Email = mail});
            return (userId, mail);
        }

        [Test]
        public async Task GetNotificationTest()
        { 
            var notificationClient = CreateNotificationsServiceClient();
            
            var (studentId, _) = await CreateAndRegisterUser();
            var notification1 = await notificationClient.Get(studentId, new NotificationFilter());

            notification1.Should().HaveCount(1);
            notification1[0].Sender.Should().BeEquivalentTo("AuthService");
        }

        [Test]
        public async Task GetMoreThanOneNotificationsTest()
        {
            var notificationClient = CreateNotificationsServiceClient();
            
            var (studentId, _) = await CreateAndRegisterUser();
            var (lectureId, _) = await CreateAndRegisterLecture();
            var notificationAfterAcceptUser = await notificationClient.Get(studentId, new NotificationFilter());
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var course = GenerateCreateCourseViewModel();
            var courseId = await lectureCourseClient.CreateCourse(course, lectureId);
            await studentCourseClient.SignInCourse(courseId, studentId);
            await lectureCourseClient.AcceptStudent(courseId, studentId);
            
            var notificationBeforeAcceptUser = await notificationClient.Get(studentId, new NotificationFilter());
            while (notificationBeforeAcceptUser.Length != 2)
            { 
                notificationBeforeAcceptUser = await notificationClient.Get(studentId, new NotificationFilter());
            }

            notificationAfterAcceptUser.Should().HaveCount(1);
            notificationBeforeAcceptUser.Should().HaveCount(2);
        }

        [Test]
        public async Task CheckMarkAsSeenTest()
        {
            var notificationClient = CreateNotificationsServiceClient();
            
            var (userId, _) = await CreateAndRegisterUser();
            var notificationBefore = await notificationClient.Get(userId, new NotificationFilter());
            var notificationId = new long[1]{notificationBefore[0].Id};
            await notificationClient.MarkAsSeen(userId, notificationId);
            var notificationAfter = await notificationClient.Get(userId, new NotificationFilter());
            
            notificationBefore.Should().HaveCount(1);
            notificationBefore[0].HasSeen.Should().BeFalse();
            notificationAfter.Should().HaveCount(1);
            notificationAfter[0].HasSeen.Should().BeTrue();
        }
    }
}