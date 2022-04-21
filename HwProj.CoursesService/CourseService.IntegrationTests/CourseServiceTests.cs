using System;
using System.Net.Http;
using HwProj.CoursesService.API;
using HwProj.CoursesService.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace CourseService.IntegrationTests
{
    public class CourseServiceTests : IClassFixture<TestingWebAppFactory>
    {
        private readonly TestingWebAppFactory _factory;
        private readonly HttpClient _client;
        
        public CourseServiceTests(TestingWebAppFactory factory)
        {
            _factory = factory;
            var client =  _factory.CreateClient();
        }
        
        [Fact]
        public async void TestGetAllCourses()
        {
            var mock = new Mock<IHttpContextAccessor>();
            var mockConfig = new Mock<IConfiguration>();
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory.Setup(f => f.CreateClient(Options.DefaultName)).Returns(_client);
            mockConfig.Setup(c => c.GetSection("Services")["Courses"]).Returns("http://localhost:5002");
            //mock.Setup(m => m.HttpContext.User.FindFirst("_id").Value).Returns("lol");
            var courseClient = new CoursesServiceClient(mockClientFactory.Object, null, mockConfig.Object);
            var result = await courseClient.GetAllCourses();
            
        }
    }
}