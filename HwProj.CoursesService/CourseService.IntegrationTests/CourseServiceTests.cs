using System;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using AutoFixture;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API;
using HwProj.CoursesService.Client;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace CourseService.IntegrationTests
{
    public class CourseServiceTests
    {
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

        private CreateCourseViewModel GenerateCourseViewModel()
        {
            var fixture = new Fixture().Build<CreateCourseViewModel>()
                .With(cvm => cvm.IsOpen, true);
            return fixture.Create();
        }
        
        private CoursesServiceClient CreateCourseServiceClient(string userId)
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration.Setup(x => x.GetSection("Services")["Courses"]).Returns("http://localhost:5002");
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory.Setup(x => x.CreateClient(Options.DefaultName)).Returns(new HttpClient());
            var mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            mockHttpContextAccessor.Setup(x => x.HttpContext.User.FindFirst("_id")).Returns(new Claim("", userId));
            return new CoursesServiceClient(mockClientFactory.Object, mockHttpContextAccessor.Object, mockIConfiguration.Object);
        }

        private AuthServiceClient CreateAuthServiceClient()
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration.Setup(x => x.GetSection("Services")["Auth"]).Returns("http://localhost:5001");
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory.Setup(x => x.CreateClient(Options.DefaultName)).Returns(new HttpClient());
            return new AuthServiceClient(mockClientFactory.Object, mockIConfiguration.Object);
        }
        
        
        [Fact]
        public async void TestCreateCourse()
        {
            // Arrange
            var authClient = CreateAuthServiceClient();
            var userData = GenerateRegisterViewModel();
            await authClient.Register(userData);
            var userId = await authClient.FindByEmailAsync(userData.Email);
            await authClient.InviteNewLecturer(new InviteLecturerViewModel() {Email = userData.Email});
            var courseClient = CreateCourseServiceClient(userId);
            var newCourseViewModel = GenerateCourseViewModel(); 
            // Act
            var courseId = await courseClient.CreateCourse(newCourseViewModel, userId);
            // Assert
            var courseFromServer = await courseClient.GetCourseById(courseId, userId);
            Assert.Equal(newCourseViewModel.Name, courseFromServer.Name);
            Assert.Equal(newCourseViewModel.GroupName, courseFromServer.GroupName);
            Assert.Contains(userId, courseFromServer.MentorIds);
        }
    }
}