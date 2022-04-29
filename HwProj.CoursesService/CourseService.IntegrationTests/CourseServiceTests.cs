using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoFixture;
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
            var (userId, mail) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(userId);
            var newCourseViewModel = GenerateCourseViewModel();
            // Act
            var courseId = await courseClient.CreateCourse(newCourseViewModel, userId);
            // Assert
            var courseFromServer = await courseClient.GetCourseById(courseId, userId);
            Assert.AreEqual(newCourseViewModel.Name, courseFromServer.Name);
            Assert.AreEqual(newCourseViewModel.GroupName, courseFromServer.GroupName);
            Assert.IsTrue(courseFromServer.MentorIds.Contains(userId));
        }

        [Test]
        public async Task TestDeleteCourse()
        {
            // Arrange
            var (userId, mail) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(userId);
            var newCourseViewModel = GenerateCourseViewModel();
            // Act
            var courseId = await courseClient.CreateCourse(newCourseViewModel, userId);
            await courseClient.DeleteCourse(courseId);
            // Assert
            var coursesFromServer = await courseClient.GetAllCourses();
            Assert.IsTrue(coursesFromServer.FirstOrDefault(c => c.Id == courseId) == null);
        }

        [Test]
        public async Task TestUpdateCourse()
        {
            // Arrange
            var (userId, mail) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(userId);
            var newCourseViewModel = GenerateCourseViewModel();
            // Act
            var courseId = await courseClient.CreateCourse(newCourseViewModel, userId);
            var updateCourse = GenerateUpdateCourseViewModel();
            await courseClient.UpdateCourse(updateCourse, courseId);
            // Assert
            var courseFromServer = await courseClient.GetCourseById(courseId, userId);
            Assert.AreEqual(updateCourse.Name, courseFromServer.Name);
            Assert.AreEqual(updateCourse.GroupName, courseFromServer.GroupName);
            Assert.AreEqual(updateCourse.IsComplete, courseFromServer.IsCompleted);
            Assert.AreEqual(updateCourse.IsOpen, courseFromServer.IsOpen);
        }
        
        [Test]
        public async Task TestSignInAndAcceptStudent()
        {   
            // Arrange
            var (lectureId, lectureMail) = await CreateAndRegisterLecture();
            var (studentId, studentMail) = await CreateAndRegisterUser();
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
            var mateBeforeAccept = courseBeforeAcceptStudent.CourseMates.FirstOrDefault(m => m.StudentId == studentId);
            var mateAfterAccept = courseAfterAcceptStudent.CourseMates.FirstOrDefault(m => m.StudentId == studentId);
            Assert.IsFalse(mateBeforeAccept.IsAccepted);
            Assert.IsTrue(mateAfterAccept.IsAccepted);
        }
        
        [Test]
        public async Task TestSignInAndRejectStudent()
        {   
            // Arrange
            var (lectureId, lectureMail) = await CreateAndRegisterLecture();
            var (studentId, studentMail) = await CreateAndRegisterUser();
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var newCourseViewModel = GenerateCourseViewModel();
            // Act
            var courseId = await lectureCourseClient.CreateCourse(newCourseViewModel, lectureId);
            await studentCourseClient.SignInCourse(courseId, studentId);
            var courseBeforeAcceptStudent = await lectureCourseClient.GetCourseById(courseId, lectureId);
            await lectureCourseClient.RejectStudent(courseId, studentId);
            var courseAfterAcceptStudent = await lectureCourseClient.GetCourseById(courseId, lectureId);
            // Assert
            var mateBeforeAccept = courseBeforeAcceptStudent.CourseMates.FirstOrDefault(m => m.StudentId == studentId);
            var mateAfterAccept = courseAfterAcceptStudent.CourseMates.FirstOrDefault(m => m.StudentId == studentId);
            Assert.IsFalse(mateBeforeAccept.IsAccepted);
            Assert.IsNull(mateAfterAccept);
        }
    }
}