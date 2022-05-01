using System.Collections.Generic;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoFixture;
using FluentAssertions;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;

namespace Tests
{
    public class Tests
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

        private UpdateCourseViewModel GenerateUpdateCourseViewModel()
        {
            var fixture = new Fixture().Build<UpdateCourseViewModel>()
                .With(cvm => cvm.IsOpen, true);
            return fixture.Create();
        }

        private CreateHomeworkViewModel GenerateCreateHomeworkViewModel()
        {
            var fixture = new Fixture().Build<CreateHomeworkViewModel>()
                .With(hvm => hvm.Tasks, new List<CreateTaskViewModel>());
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
            return new CoursesServiceClient(mockClientFactory.Object, mockHttpContextAccessor.Object,
                mockIConfiguration.Object);
        }

        private AuthServiceClient CreateAuthServiceClient()
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration.Setup(x => x.GetSection("Services")["Auth"]).Returns("http://localhost:5001");
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory.Setup(x => x.CreateClient(Options.DefaultName)).Returns(new HttpClient());
            return new AuthServiceClient(mockClientFactory.Object, mockIConfiguration.Object);
        }

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
        public async Task TestCreateCourse()
        {
            // Arrange
            var (userId, _) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(userId);
            var newCourseViewModel = GenerateCourseViewModel();
            // Act
            var courseId = await courseClient.CreateCourse(newCourseViewModel, userId);
            // Assert
            var courseFromServer = await courseClient.GetCourseById(courseId, userId);
            courseFromServer.Should().BeEquivalentTo(newCourseViewModel);
        }

        [Test]
        public async Task TestDeleteCourse()
        {
            // Arrange
            var (userId, _) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(userId);
            var newCourseViewModel = GenerateCourseViewModel();
            // Act
            var courseId = await courseClient.CreateCourse(newCourseViewModel, userId);
            await courseClient.DeleteCourse(courseId);
            // Assert
            var coursesFromServer = await courseClient.GetAllCourses();
            coursesFromServer.Should().NotContain(c => c.Id == courseId);
        }

        [Test]
        public async Task TestUpdateCourse()
        {
            // Arrange
            var (userId, _) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(userId);
            var newCourseViewModel = GenerateCourseViewModel();
            // Act
            var courseId = await courseClient.CreateCourse(newCourseViewModel, userId);
            var updateCourse = GenerateUpdateCourseViewModel();
            await courseClient.UpdateCourse(updateCourse, courseId);
            // Assert
            var courseFromServer = await courseClient.GetCourseById(courseId, userId);
            courseFromServer.Should().BeEquivalentTo(updateCourse);
        }
        
        [Test]
        public async Task TestSignInAndAcceptStudent()
        {   
            // Arrange
            var (lectureId, _) = await CreateAndRegisterLecture();
            var (studentId, _) = await CreateAndRegisterUser();
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var newCourseViewModel = GenerateCourseViewModel();
            // Act
            var courseId = await lectureCourseClient.CreateCourse(newCourseViewModel, lectureId);
            await studentCourseClient.SignInCourse(courseId, studentId);
            var courseBeforeAcceptStudent = await lectureCourseClient.GetCourseById(courseId, lectureId);
            await lectureCourseClient.AcceptStudent(courseId, studentId);
            var courseAfterAcceptStudent = await lectureCourseClient.GetCourseById(courseId, lectureId);
            // Assert
            courseBeforeAcceptStudent.CourseMates.Should().Contain(s => s.StudentId == studentId).Which.IsAccepted
                .Should().BeFalse();
            courseAfterAcceptStudent.CourseMates.Should().Contain(s => s.StudentId == studentId).Which.IsAccepted
                .Should().BeTrue();
        }
        
        [Test]
        public async Task TestSignInAndRejectStudent()
        {   
            // Arrange
            var (lectureId, _) = await CreateAndRegisterLecture();
            var (studentId, _) = await CreateAndRegisterUser();
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var newCourseViewModel = GenerateCourseViewModel();
            // Act
            var courseId = await lectureCourseClient.CreateCourse(newCourseViewModel, lectureId);
            await studentCourseClient.SignInCourse(courseId, studentId);
            var courseBeforeRejectStudent = await lectureCourseClient.GetCourseById(courseId, lectureId);
            await lectureCourseClient.RejectStudent(courseId, studentId);
            var courseAfterRejectStudent = await lectureCourseClient.GetCourseById(courseId, lectureId);
            // Assert
            courseBeforeRejectStudent.CourseMates.Should().Contain(s => s.StudentId == studentId).Which.IsAccepted
                .Should().BeFalse();
            courseAfterRejectStudent.CourseMates.Should().NotContain(s => s.StudentId == studentId);
        }

        [Test]
        public async Task TestAddHomeworkToCourse()
        {
            // Arrange
            var (lectureId, _) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(lectureId);
            var newCourseViewModel = GenerateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            // Act
            var courseId = await courseClient.CreateCourse(newCourseViewModel, lectureId);
            var homeworkId = await courseClient.AddHomeworkToCourse(newHomeworkViewModel, courseId);
            var course = await courseClient.GetCourseById(courseId, lectureId);
            var homework = await courseClient.GetHomework(homeworkId);
            // Arrange
            homework.Should().BeEquivalentTo(newHomeworkViewModel);
            course.Homeworks.Should().Contain(h => h.Id == homeworkId).Which.Should()
                .BeEquivalentTo(newHomeworkViewModel);
        }
    }
}