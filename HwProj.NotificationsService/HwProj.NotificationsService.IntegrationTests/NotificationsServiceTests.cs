using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Claims;
using System.Threading;
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
using HwProj.Models.SolutionsService;
using HwProj.NotificationsService.Client;
using HwProj.SolutionsService.Client;
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
        
        private SolutionsServiceClient CreateSolutionsServiceClient()
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration
                .Setup(x => x.GetSection("Services")["Solutions"])
                .Returns("http://localhost:5007");
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory
                .Setup(x => x.CreateClient(Options.DefaultName))
                .Returns(new HttpClient());
            return new SolutionsServiceClient(mockClientFactory.Object, mockIConfiguration.Object);
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
        
        private CreateHomeworkViewModel GenerateCreateHomeworkViewModel()
            => new Fixture().Build<CreateHomeworkViewModel>()
                .With(h => h.Tasks, new List<CreateTaskViewModel>())
                .Create();

        private CreateTaskViewModel GenerateCreateTaskViewModel()
            => new Fixture().Build<CreateTaskViewModel>()
                .With(t => t.HasDeadline, false)
                .With(t => t.IsDeadlineStrict, false)
                .Create();

        private SolutionViewModel GenerateSolutionViewModel(string studentId)
            => new Fixture().Build<SolutionViewModel>()
                .With(s => s.StudentId, studentId)
                .Create();

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
        public async Task NotificationRegisterTest()
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
        public async Task NotificationAcceptLectureTest()
        {
            var (lectureId1, _) = await CreateAndRegisterLecture();
            var (lectureId2, lectureEmail2) = await CreateAndRegisterLecture();
            var lecture1CourseClient = CreateCourseServiceClient(lectureId1);
            var course = GenerateCreateCourseViewModel();
            var courseId = await lecture1CourseClient.CreateCourse(course, lectureId1);
            await lecture1CourseClient.AcceptLecturer(courseId, lectureEmail2);
            
            Thread.Sleep(5000);
            var notificationClient = CreateNotificationsServiceClient();
            var notification = await notificationClient.Get(lectureId2, new NotificationFilter());

            notification.Should().Contain(n => n.Sender == "AuthService");
        }

        [Test]
        public async Task NotificationLectureAcceptOrRejectStudentTest()
        {
            var (lectureId1, _) = await CreateAndRegisterLecture();
            var (lectureId2, lectureEmail2) = await CreateAndRegisterLecture();
            var lecture1CourseClient = CreateCourseServiceClient(lectureId1);
            var course = GenerateCreateCourseViewModel();
            var courseId = await lecture1CourseClient.CreateCourse(course, lectureId1);
            await lecture1CourseClient.AcceptLecturer(courseId, lectureEmail2);
            
            Thread.Sleep(5000);
            var notificationClient = CreateNotificationsServiceClient();
            var notification = await notificationClient.Get(lectureId2, new NotificationFilter());

            notification.Should().Contain(n => n.Sender == "AuthService");
        }
        
        [Test]
        public async Task NotificationNewCourseMateTest()
        {
            var (studentId, _) = await CreateAndRegisterUser();
            var (lectureId, _) = await CreateAndRegisterLecture();
            var (lectureId2, lectureEmail2) = await CreateAndRegisterLecture();
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var course = GenerateCreateCourseViewModel();
            var courseId = await lectureCourseClient.CreateCourse(course, lectureId);
            await lectureCourseClient.AcceptLecturer(courseId, lectureEmail2);
            await studentCourseClient.SignInCourse(courseId, studentId);
            
            Thread.Sleep(5000);
            var notificationClient = CreateNotificationsServiceClient();
            var notificationLecture = await notificationClient.Get(lectureId, new NotificationFilter());
            var notificationLecture2 = await notificationClient.Get(lectureId2, new NotificationFilter());

            notificationLecture.Should().Contain(n => n.Sender == "CourseService");
            notificationLecture2.Should().Contain(n => n.Sender == "CourseService");
        }
        
        [Test]
        public async Task NotificationNewHomeworkTest()
        {
            var (studentId, _) = await CreateAndRegisterUser();
            var (studentId1, _) = await CreateAndRegisterUser();
            var (lectureId, _) = await CreateAndRegisterLecture();
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var student1CourseClient = CreateCourseServiceClient(studentId1);
            var course = GenerateCreateCourseViewModel();
            var courseId = await lectureCourseClient.CreateCourse(course, lectureId);
            await studentCourseClient.SignInCourse(courseId, studentId);
            await lectureCourseClient.AcceptStudent(courseId, studentId);
            await student1CourseClient.SignInCourse(courseId, studentId1);
            await lectureCourseClient.AcceptStudent(courseId, studentId1);

            var hwCreateViewModel = GenerateCreateHomeworkViewModel();
            var taskCreateViewModel = GenerateCreateTaskViewModel();
            var homeworkId = await lectureCourseClient.AddHomeworkToCourse(hwCreateViewModel, courseId);
            var taskId = await lectureCourseClient.AddTask(taskCreateViewModel, homeworkId);
            
            Thread.Sleep(5000);
            var notificationClient = CreateNotificationsServiceClient();
            var notificationStudent = await notificationClient.Get(studentId, new NotificationFilter());
            var notificationStudent1 = await notificationClient.Get(studentId1, new NotificationFilter());

            notificationStudent.Should().Contain(n => n.Sender == "CourseService");
            notificationStudent1.Should().Contain(n => n.Sender == "CourseService");
        }
        
        [Test]
        public async Task NotificationUpdateHomeworkTest()
        {
            var (studentId, _) = await CreateAndRegisterUser();
            var (studentId1, _) = await CreateAndRegisterUser();
            var (lectureId, _) = await CreateAndRegisterLecture();
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var student1CourseClient = CreateCourseServiceClient(studentId1);
            var course = GenerateCreateCourseViewModel();
            var courseId = await lectureCourseClient.CreateCourse(course, lectureId);
            await studentCourseClient.SignInCourse(courseId, studentId);
            await lectureCourseClient.AcceptStudent(courseId, studentId);
            await student1CourseClient.SignInCourse(courseId, studentId1);
            await lectureCourseClient.AcceptStudent(courseId, studentId1);

            var hwCreateViewModel = GenerateCreateHomeworkViewModel();
            var taskCreateViewModel = GenerateCreateTaskViewModel();
            var homeworkId = await lectureCourseClient.AddHomeworkToCourse(hwCreateViewModel, courseId);
            hwCreateViewModel.Description = "Update";
            await lectureCourseClient.UpdateHomework(hwCreateViewModel, homeworkId);
            var taskId = await lectureCourseClient.AddTask(taskCreateViewModel, homeworkId);
            
            Thread.Sleep(5000);
            var notificationClient = CreateNotificationsServiceClient();
            var notificationStudent = await notificationClient.Get(studentId, new NotificationFilter());
            var notificationStudent1 = await notificationClient.Get(studentId1, new NotificationFilter());

            var notificationBody = $"В курсе <a href='courses/{courseId}'>{course.Name}</a> домашнее задание <i>{hwCreateViewModel.Title}</i> обновлено.";
            
            notificationStudent.Should().Contain(n => n.Body == notificationBody);
            notificationStudent1.Should().Contain(n => n.Body == notificationBody);
        }
        
                [Test]
        public async Task NotificationUpdateTaskMaxRatingTest()
        {
            var (studentId, _) = await CreateAndRegisterUser();
            var (studentId1, _) = await CreateAndRegisterUser();
            var (lectureId, _) = await CreateAndRegisterLecture();
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var student1CourseClient = CreateCourseServiceClient(studentId1);
            var course = GenerateCreateCourseViewModel();
            var courseId = await lectureCourseClient.CreateCourse(course, lectureId);
            await studentCourseClient.SignInCourse(courseId, studentId);
            await lectureCourseClient.AcceptStudent(courseId, studentId);
            await student1CourseClient.SignInCourse(courseId, studentId1);
            await lectureCourseClient.AcceptStudent(courseId, studentId1);

            var hwCreateViewModel = GenerateCreateHomeworkViewModel();
            var taskCreateViewModel = GenerateCreateTaskViewModel();
            var homeworkId = await lectureCourseClient.AddHomeworkToCourse(hwCreateViewModel, courseId);
            var taskId = await lectureCourseClient.AddTask(taskCreateViewModel, homeworkId);
            taskCreateViewModel.Description = "Update";
            await lectureCourseClient.UpdateTask(taskCreateViewModel, taskId);
            
            Thread.Sleep(5000);
            var notificationClient = CreateNotificationsServiceClient();
            var notificationStudent = await notificationClient.Get(studentId, new NotificationFilter());
            var notificationStudent1 = await notificationClient.Get(studentId1, new NotificationFilter());

            var notificationBody = $"<a href='task/{taskId}'>Задача</a> обновлена.";
            
            notificationStudent.Should().Contain(n => n.Body == notificationBody);
            notificationStudent1.Should().Contain(n => n.Body == notificationBody);
        }
        
        [Test]
        public async Task NotificationStudentPassTaskTest()
        {
            var (studentId, _) = await CreateAndRegisterUser();
            var (lectureId, _) = await CreateAndRegisterLecture();
            var (lectureId2, lectureEmail2) = await CreateAndRegisterLecture();
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var course = GenerateCreateCourseViewModel();
            var courseId = await lectureCourseClient.CreateCourse(course, lectureId);
            await lectureCourseClient.AcceptLecturer(courseId, lectureEmail2);
            await studentCourseClient.SignInCourse(courseId, studentId);
            await lectureCourseClient.AcceptStudent(courseId, studentId);

            var hwCreateViewModel = GenerateCreateHomeworkViewModel();
            var taskCreateViewModel = GenerateCreateTaskViewModel();
            var homeworkId = await lectureCourseClient.AddHomeworkToCourse(hwCreateViewModel, courseId);
            var taskId = await lectureCourseClient.AddTask(taskCreateViewModel, homeworkId);
            var solutionViewModel = GenerateSolutionViewModel(studentId);
            var solutionServiceClient = CreateSolutionsServiceClient();
            var solutionId = await solutionServiceClient.PostSolution(solutionViewModel, taskId);
            
            Thread.Sleep(5000);
            var notificationClient = CreateNotificationsServiceClient();
            var notificationLecture = await notificationClient.Get(lectureId, new NotificationFilter());
            var notificationLecture2 = await notificationClient.Get(lectureId2, new NotificationFilter());

            notificationLecture.Should().Contain(n => n.Sender == "SolutionService");
            notificationLecture2.Should().Contain(n => n.Sender == "SolutionService");
        }
        
        [Test]
        public async Task NotificationRateTest()
        {
            var (studentId, _) = await CreateAndRegisterUser();
            var (lectureId, _) = await CreateAndRegisterLecture();
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var course = GenerateCreateCourseViewModel();
            var courseId = await lectureCourseClient.CreateCourse(course, lectureId);
            await studentCourseClient.SignInCourse(courseId, studentId);
            await lectureCourseClient.AcceptStudent(courseId, studentId);

            var hwCreateViewModel = GenerateCreateHomeworkViewModel();
            var taskCreateViewModel = GenerateCreateTaskViewModel();
            var homeworkId = await lectureCourseClient.AddHomeworkToCourse(hwCreateViewModel, courseId);
            var taskId = await lectureCourseClient.AddTask(taskCreateViewModel, homeworkId);
            var solutionViewModel = GenerateSolutionViewModel(studentId);
            var solutionServiceClient = CreateSolutionsServiceClient();
            var solutionId = await solutionServiceClient.PostSolution(solutionViewModel, taskId);
            await solutionServiceClient.RateSolution(solutionId, 3, "", lectureId);
            
            Thread.Sleep(5000);
            var notificationClient = CreateNotificationsServiceClient();
            var notificationLecture = await notificationClient.Get(studentId, new NotificationFilter());

            notificationLecture.Should().Contain(n => n.Sender == "SolutionService");
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