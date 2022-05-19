using System;
using System.Collections.Generic;
using System.Linq;
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

namespace CourseService.IntegrationTests
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

        private CreateCourseViewModel GenerateCreateCourseViewModel()
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

        private CreateTaskViewModel GenerateCreateTaskViewModel()
        {
            return new Fixture().Build<CreateTaskViewModel>().Create();
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
            var newCourseViewModel = GenerateCreateCourseViewModel();
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
            var newCourseViewModel = GenerateCreateCourseViewModel();
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
            var newCourseViewModel = GenerateCreateCourseViewModel();
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
            var newCourseViewModel = GenerateCreateCourseViewModel();
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
            var newCourseViewModel = GenerateCreateCourseViewModel();
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
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            // Act
            var courseId = await courseClient.CreateCourse(newCourseViewModel, lectureId);
            var homeworkId = (await courseClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            var course = await courseClient.GetCourseById(courseId, lectureId);
            var homework = await courseClient.GetHomework(homeworkId);
            // Assert
            homework.Should().BeEquivalentTo(newHomeworkViewModel);
            course.Homeworks.Should().Contain(h => h.Id == homeworkId).Which.Should()
                .BeEquivalentTo(newHomeworkViewModel);
        }

        [Test]
        public async Task TestUpdateHomework()
        {
            // Arrange
            var (lectureId, _) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(lectureId);
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var courseId = await courseClient.CreateCourse(newCourseViewModel, lectureId);
            var homeworkId = (await courseClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            var updateHomeworkViewModel = GenerateCreateHomeworkViewModel();
            // Act
            await courseClient.UpdateHomework(updateHomeworkViewModel, homeworkId);
            var course = await courseClient.GetCourseById(courseId, lectureId);
            var homework = await courseClient.GetHomework(homeworkId);
            // Assert
            homework.Should().BeEquivalentTo(updateHomeworkViewModel);
            course.Homeworks.Should().Contain(h => h.Id == homeworkId).Which.Should()
                .BeEquivalentTo(updateHomeworkViewModel);
        }

        [Test]
        public async Task TestDeleteHomework()
        {
            var (lectureId, _) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(lectureId);
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var courseId = await courseClient.CreateCourse(newCourseViewModel, lectureId);
            var homeworkId = (await courseClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            // Act
            await courseClient.DeleteHomework(homeworkId);
            var course = await courseClient.GetCourseById(courseId, lectureId);
            // Assert
            course.Homeworks.Should().NotContain(h => h.Id == homeworkId);
        }

        [Test]
        public async Task TestAddTask()
        {
            // Arrange
            var (lectureId, _) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(lectureId);
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var newTaskViewModel = GenerateCreateTaskViewModel();
            var courseId = await courseClient.CreateCourse(newCourseViewModel, lectureId);
            var homeworkId = (await courseClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            // Act
            var taskId = (await courseClient.AddTask(newTaskViewModel, homeworkId)).Value;
            var course = await courseClient.GetCourseById(courseId, lectureId);
            var homework = await courseClient.GetHomework(homeworkId);
            var task = await courseClient.GetTask(taskId);
            // Assert
            course.Homeworks.Should().Contain(h => h.Id == homeworkId)
                .Which.Tasks.Should().Contain(t => t.Id == taskId)
                .Which.Should().BeEquivalentTo(newTaskViewModel);
            homework.Tasks.Should().Contain(t => t.Id == taskId)
                .Which.Should().BeEquivalentTo(newTaskViewModel);
            task.Should().BeEquivalentTo(newTaskViewModel);
            task.HomeworkId.Should().Be(homeworkId);
        }

        [Test]
        public async Task TestUpdateTask()
        {   
            // Arrange
            var (lectureId, _) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(lectureId);
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var newTaskViewModel = GenerateCreateTaskViewModel();
            var updateTaskViewModel = GenerateCreateTaskViewModel();
            var courseId = await courseClient.CreateCourse(newCourseViewModel, lectureId);
            var homeworkId = (await courseClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            var taskId = (await courseClient.AddTask(newTaskViewModel, homeworkId)).Value;
            // Act 
            await courseClient.UpdateTask(updateTaskViewModel, taskId);
            var course = await courseClient.GetCourseById(courseId, lectureId);
            var homework = await courseClient.GetHomework(homeworkId);
            var task = await courseClient.GetTask(taskId);
            // Assert
            course.Homeworks.Should().Contain(h => h.Id == homeworkId)
                .Which.Tasks.Should().Contain(t => t.Id == taskId)
                .Which.Should().BeEquivalentTo(updateTaskViewModel);
            homework.Tasks.Should().Contain(t => t.Id == taskId)
                .Which.Should().BeEquivalentTo(updateTaskViewModel);
            task.Should().BeEquivalentTo(updateTaskViewModel);
        }
        
        [Test]
        public async Task TestDeleteTask()
        {   
            // Arrange
            var (lectureId, _) = await CreateAndRegisterLecture();
            var courseClient = CreateCourseServiceClient(lectureId);
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var newTaskViewModel = GenerateCreateTaskViewModel();
            var courseId = await courseClient.CreateCourse(newCourseViewModel, lectureId);
            var homeworkId = (await courseClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            var taskId = (await courseClient.AddTask(newTaskViewModel, homeworkId)).Value;
            // Act 
            await courseClient.DeleteTask(taskId);
            var course = await courseClient.GetCourseById(courseId, lectureId);
            var homework = await courseClient.GetHomework(homeworkId);
            // Assert
            course.Homeworks.Should().Contain(h => h.Id == homeworkId)
                .Which.Tasks.Should().NotContain(t => t.Id == taskId);
            homework.Tasks.Should().NotContain(t => t.Id == taskId);
        }
    
        [Test]
        public async Task TestAcceptLecture()
        {   
            // Arrange
            var (lectureId, _) = await CreateAndRegisterLecture();
            var (anotherLectureId, anotherLectureMail) = await CreateAndRegisterLecture();
            var lectureClient = CreateCourseServiceClient(lectureId);
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var courseId = await lectureClient.CreateCourse(newCourseViewModel, lectureId);
            // Act
            await lectureClient.AcceptLecturer(courseId, anotherLectureMail);
            var course = await lectureClient.GetCourseById(courseId, lectureId);
            // Assert
            course.MentorIds.Should().Contain(anotherLectureId);
        }

        [Test]
        public async Task TestStudentCannotBeAcceptedAsLecture()
        {
            var (lectureId, _) = await CreateAndRegisterLecture();
            var (studentId, studentEmail) = await CreateAndRegisterUser();
            var lectureClient = CreateCourseServiceClient(lectureId);
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var courseId = await lectureClient.CreateCourse(newCourseViewModel, lectureId);
            // Act
            await lectureClient.AcceptLecturer(courseId, studentEmail);
            var course = await lectureClient.GetCourseById(courseId, lectureId);
            // Assert
            course.MentorIds.Should().NotContain(studentId);
        }

        [Test]
        public async Task TestLectureWhenWasAcceptedShouldNotBeContainedInCourseMates()
        {
            // Arrange
            var (lectureId, _) = await CreateAndRegisterLecture();
            var (anotherLectureId, anotherLectureMail) = await CreateAndRegisterLecture();
            var lectureClient = CreateCourseServiceClient(lectureId);
            var anotherLectureClient = CreateCourseServiceClient(anotherLectureId);
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var courseId = await lectureClient.CreateCourse(newCourseViewModel, lectureId);
            // Act
            await anotherLectureClient.SignInCourse(courseId, anotherLectureId);
            await lectureClient.AcceptLecturer(courseId, anotherLectureMail);
            var course = await lectureClient.GetCourseById(courseId, lectureId);
            // Assert
            course.MentorIds.Should().Contain(anotherLectureId);
            course.CourseMates.Should().NotContain(m => m.StudentId == anotherLectureId);
        }
        
        [Test]
        public async Task TestPublicationDateForTask()
        {   
            // Arrange
            var (lectureId, _) = await CreateAndRegisterLecture();
            var (studentId, _) = await CreateAndRegisterUser();
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var firstTaskViewModel = GenerateCreateTaskViewModel();
            firstTaskViewModel.PublicationDate = DateTime.UtcNow.AddHours(3);
            var secondTaskViewModel = GenerateCreateTaskViewModel();
            secondTaskViewModel.PublicationDate = DateTime.UtcNow.AddHours(4);
            var courseId = await lectureCourseClient.CreateCourse(newCourseViewModel, lectureId);
            var homeworkId = (await lectureCourseClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            var task1Id = (await lectureCourseClient.AddTask(firstTaskViewModel, homeworkId)).Value;
            var task2Id = (await lectureCourseClient.AddTask(secondTaskViewModel, homeworkId)).Value;
            var courseFromStudent = await studentCourseClient.GetCourseById(courseId, studentId);
            var courseFromLecture = await lectureCourseClient.GetCourseById(courseId, lectureId);
            // Assert
            var hwFromStudent = courseFromStudent.Homeworks.First(h => h.Id == homeworkId);
            var hwFromLecture = courseFromLecture.Homeworks.First(h => h.Id == homeworkId);
            hwFromStudent.Tasks.Should().Contain(t => t.Id == task1Id);
            hwFromStudent.Tasks.Should().NotContain(t => t.Id == task2Id);
            hwFromLecture.Tasks.Should().Contain(t => t.Id == task1Id);
            hwFromLecture.Tasks.Should().Contain(t => t.Id == task2Id);
        }
        
        [Test]
        public async Task TestUpdateCourseOnlyForCourseMentor()
        {   
            // Arrange
            var (courseLectureId, _) = await CreateAndRegisterLecture();
            var (studentInCourseId, _) = await CreateAndRegisterUser();
            var (anotherLectureId, _) = await CreateAndRegisterLecture();
            var (anotherStudentId, _) = await CreateAndRegisterUser();
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var updateViewModel = GenerateUpdateCourseViewModel();
            var courseLectureClient = CreateCourseServiceClient(courseLectureId);
            var studentInCourseClient = CreateCourseServiceClient(studentInCourseId);
            var anotherLectureClient = CreateCourseServiceClient(anotherLectureId);
            var anotherStudentClient = CreateCourseServiceClient(anotherStudentId);
            var courseId = await courseLectureClient.CreateCourse(newCourseViewModel, courseLectureId);
            await studentInCourseClient.SignInCourse(courseId, studentInCourseId);
            await courseLectureClient.AcceptStudent(courseId, studentInCourseId);
            // Act
            var responseForStudentInCourse = await studentInCourseClient.UpdateCourse(updateViewModel, courseId);
            var responseForAnotherStudent = await anotherStudentClient.UpdateCourse(updateViewModel, courseId);
            var responseForAnotherLecture = await anotherLectureClient.UpdateCourse(updateViewModel, courseId);
            // Assert
            responseForAnotherLecture.Succeeded.Should().BeFalse();
            responseForAnotherStudent.Succeeded.Should().BeFalse();
            responseForStudentInCourse.Succeeded.Should().BeFalse();
        }
        
        [Test]
        public async Task TestDeleteCourseOnlyForCourseMentor()
        {   
            // Arrange
            var (courseLectureId, _) = await CreateAndRegisterLecture();
            var (studentInCourseId, _) = await CreateAndRegisterUser();
            var (anotherLectureId, _) = await CreateAndRegisterLecture();
            var (anotherStudentId, _) = await CreateAndRegisterUser();
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var courseLectureClient = CreateCourseServiceClient(courseLectureId);
            var studentInCourseClient = CreateCourseServiceClient(studentInCourseId);
            var anotherLectureClient = CreateCourseServiceClient(anotherLectureId);
            var anotherStudentClient = CreateCourseServiceClient(anotherStudentId);
            var courseId = await courseLectureClient.CreateCourse(newCourseViewModel, courseLectureId);
            await studentInCourseClient.SignInCourse(courseId, studentInCourseId);
            await courseLectureClient.AcceptStudent(courseId, studentInCourseId);
            // Act
            var responseForStudentInCourse = await studentInCourseClient.DeleteCourse(courseId);
            var responseForAnotherStudent = await anotherStudentClient.DeleteCourse(courseId);
            var responseForAnotherLecture = await anotherLectureClient.DeleteCourse(courseId);
            // Assert
            responseForAnotherLecture.Succeeded.Should().BeFalse();
            responseForAnotherStudent.Succeeded.Should().BeFalse();
            responseForStudentInCourse.Succeeded.Should().BeFalse();
        }

        [Test]
        public async Task TestAddHomeworkOnlyForCourseMentor()
        {
            // Arrange
            var (courseLectureId, _) = await CreateAndRegisterLecture();
            var (studentInCourseId, _) = await CreateAndRegisterUser();
            var (anotherLectureId, _) = await CreateAndRegisterLecture();
            var (anotherStudentId, _) = await CreateAndRegisterUser();
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var courseLectureClient = CreateCourseServiceClient(courseLectureId);
            var studentInCourseClient = CreateCourseServiceClient(studentInCourseId);
            var anotherLectureClient = CreateCourseServiceClient(anotherLectureId);
            var anotherStudentClient = CreateCourseServiceClient(anotherStudentId);
            var courseId = await courseLectureClient.CreateCourse(newCourseViewModel, courseLectureId);
            await studentInCourseClient.SignInCourse(courseId, studentInCourseId);
            await courseLectureClient.AcceptStudent(courseId, studentInCourseId);
            // Act
            var responseForStudentInCourse = await studentInCourseClient.AddHomeworkToCourse(newHomeworkViewModel, courseId);
            var responseForAnotherStudent =
                await anotherStudentClient.AddHomeworkToCourse(newHomeworkViewModel, courseId);
            var responseForAnotherLecture = await anotherLectureClient.AddHomeworkToCourse(newHomeworkViewModel, courseId);
            //Assert
            responseForAnotherLecture.Succeeded.Should().BeFalse();
            responseForAnotherStudent.Succeeded.Should().BeFalse();
            responseForStudentInCourse.Succeeded.Should().BeFalse();
        }

        [Test]
        public async Task TestUpdateHomeworkOnlyForCourseMentor()
        {
            var (courseLectureId, _) = await CreateAndRegisterLecture();
            var (studentInCourseId, _) = await CreateAndRegisterUser();
            var (anotherLectureId, _) = await CreateAndRegisterLecture();
            var (anotherStudentId, _) = await CreateAndRegisterUser();
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var updateHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var courseLectureClient = CreateCourseServiceClient(courseLectureId);
            var studentInCourseClient = CreateCourseServiceClient(studentInCourseId);
            var anotherLectureClient = CreateCourseServiceClient(anotherLectureId);
            var anotherStudentClient = CreateCourseServiceClient(anotherStudentId);
            var courseId = await courseLectureClient.CreateCourse(newCourseViewModel, courseLectureId);
            await studentInCourseClient.SignInCourse(courseId, studentInCourseId);
            await courseLectureClient.AcceptStudent(courseId, studentInCourseId);
            var homeworkId = (await courseLectureClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            // Act
            var responseForStudentInCourse = await studentInCourseClient.UpdateHomework(updateHomeworkViewModel, homeworkId);
            var responseForAnotherStudent =
                await anotherStudentClient.UpdateHomework(updateHomeworkViewModel, homeworkId);
            var responseForAnotherLecture = await anotherLectureClient.UpdateHomework(updateHomeworkViewModel, homeworkId);
            //Assert
            responseForAnotherLecture.Succeeded.Should().BeFalse();
            responseForAnotherStudent.Succeeded.Should().BeFalse();
            responseForStudentInCourse.Succeeded.Should().BeFalse();
        }

        [Test]
        public async Task TestDeleteHomeworkOnlyForCourseMentor()
        {
            // Arrange
            var (courseLectureId, _) = await CreateAndRegisterLecture();
            var (studentInCourseId, _) = await CreateAndRegisterUser();
            var (anotherLectureId, _) = await CreateAndRegisterLecture();
            var (anotherStudentId, _) = await CreateAndRegisterUser();
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var courseLectureClient = CreateCourseServiceClient(courseLectureId);
            var studentInCourseClient = CreateCourseServiceClient(studentInCourseId);
            var anotherLectureClient = CreateCourseServiceClient(anotherLectureId);
            var anotherStudentClient = CreateCourseServiceClient(anotherStudentId);
            var courseId = await courseLectureClient.CreateCourse(newCourseViewModel, courseLectureId);
            await studentInCourseClient.SignInCourse(courseId, studentInCourseId);
            await courseLectureClient.AcceptStudent(courseId, studentInCourseId);
            var homeworkId = (await courseLectureClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            // Act
            var responseForStudentInCourse = await studentInCourseClient.DeleteHomework(homeworkId);
            var responseForAnotherStudent =
                await anotherStudentClient.DeleteHomework(homeworkId);
            var responseForAnotherLecture = await anotherLectureClient.DeleteHomework(homeworkId);
            //Assert
            responseForAnotherLecture.Succeeded.Should().BeFalse();
            responseForAnotherStudent.Succeeded.Should().BeFalse();
            responseForStudentInCourse.Succeeded.Should().BeFalse();
        }

        [Test]
        public async Task TestAddTaskForCourseMentorOnly()
        {   
            // Arrange
            var (courseLectureId, _) = await CreateAndRegisterLecture();
            var (studentInCourseId, _) = await CreateAndRegisterUser();
            var (anotherLectureId, _) = await CreateAndRegisterLecture();
            var (anotherStudentId, _) = await CreateAndRegisterUser();
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var newTaskViewModel = GenerateCreateTaskViewModel();
            var courseLectureClient = CreateCourseServiceClient(courseLectureId);
            var studentInCourseClient = CreateCourseServiceClient(studentInCourseId);
            var anotherLectureClient = CreateCourseServiceClient(anotherLectureId);
            var anotherStudentClient = CreateCourseServiceClient(anotherStudentId);
            var courseId = await courseLectureClient.CreateCourse(newCourseViewModel, courseLectureId);
            await studentInCourseClient.SignInCourse(courseId, studentInCourseId);
            await courseLectureClient.AcceptStudent(courseId, studentInCourseId);
            var homeworkId = (await courseLectureClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            // Act
            var responseForStudentInCourse = await studentInCourseClient.AddTask(newTaskViewModel, homeworkId);
            var responseForAnotherStudent = await anotherStudentClient.AddTask(newTaskViewModel, homeworkId);
            var responseForAnotherLecture = await anotherLectureClient.AddTask(newTaskViewModel, homeworkId);
            //Assert
            responseForAnotherLecture.Succeeded.Should().BeFalse();
            responseForAnotherStudent.Succeeded.Should().BeFalse();
            responseForStudentInCourse.Succeeded.Should().BeFalse();
        }
        
        [Test]
        public async Task TestUpdateTaskForCourseMentorOnly()
        {   
            // Arrange
            var (courseLectureId, _) = await CreateAndRegisterLecture();
            var (studentInCourseId, _) = await CreateAndRegisterUser();
            var (anotherLectureId, _) = await CreateAndRegisterLecture();
            var (anotherStudentId, _) = await CreateAndRegisterUser();
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var newTaskViewModel = GenerateCreateTaskViewModel();
            var updateTaskViewModel = GenerateCreateTaskViewModel();
            var courseLectureClient = CreateCourseServiceClient(courseLectureId);
            var studentInCourseClient = CreateCourseServiceClient(studentInCourseId);
            var anotherLectureClient = CreateCourseServiceClient(anotherLectureId);
            var anotherStudentClient = CreateCourseServiceClient(anotherStudentId);
            var courseId = await courseLectureClient.CreateCourse(newCourseViewModel, courseLectureId);
            await studentInCourseClient.SignInCourse(courseId, studentInCourseId);
            await courseLectureClient.AcceptStudent(courseId, studentInCourseId);
            var homeworkId = (await courseLectureClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            var taskId = (await courseLectureClient.AddTask(newTaskViewModel, homeworkId)).Value;
            // Act
            var responseForStudentInCourse = await studentInCourseClient.UpdateTask(updateTaskViewModel, taskId);
            var responseForAnotherStudent = await anotherStudentClient.UpdateTask(updateTaskViewModel, taskId);
            var responseForAnotherLecture = await anotherLectureClient.UpdateTask(updateTaskViewModel, taskId);
            //Assert
            responseForAnotherLecture.Succeeded.Should().BeFalse();
            responseForAnotherStudent.Succeeded.Should().BeFalse();
            responseForStudentInCourse.Succeeded.Should().BeFalse();
        }
        
        [Test]
        public async Task TestDeleteTaskForCourseMentorOnly()
        {
            // Arrange
            var (courseLectureId, _) = await CreateAndRegisterLecture();
            var (studentInCourseId, _) = await CreateAndRegisterUser();
            var (anotherLectureId, _) = await CreateAndRegisterLecture();
            var (anotherStudentId, _) = await CreateAndRegisterUser();
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var newTaskViewModel = GenerateCreateTaskViewModel();
            var courseLectureClient = CreateCourseServiceClient(courseLectureId);
            var studentInCourseClient = CreateCourseServiceClient(studentInCourseId);
            var anotherLectureClient = CreateCourseServiceClient(anotherLectureId);
            var anotherStudentClient = CreateCourseServiceClient(anotherStudentId);
            var courseId = await courseLectureClient.CreateCourse(newCourseViewModel, courseLectureId);
            await studentInCourseClient.SignInCourse(courseId, studentInCourseId);
            await courseLectureClient.AcceptStudent(courseId, studentInCourseId);
            var homeworkId = (await courseLectureClient.AddHomeworkToCourse(newHomeworkViewModel, courseId)).Value;
            var taskId = (await courseLectureClient.AddTask(newTaskViewModel, homeworkId)).Value;
            // Act
            var responseForStudentInCourse = await studentInCourseClient.DeleteTask(taskId);
            var responseForAnotherStudent = await anotherStudentClient.DeleteTask(taskId);
            var responseForAnotherLecture = await anotherLectureClient.DeleteTask(taskId);
            //Assert
            responseForAnotherLecture.Succeeded.Should().BeFalse();
            responseForAnotherStudent.Succeeded.Should().BeFalse();
            responseForStudentInCourse.Succeeded.Should().BeFalse();
        }

        [Test]
        public async Task TestAcceptStudentForCourseMentorOnly()
        {   
            // Assert
            var (courseLectureId, _) = await CreateAndRegisterLecture();
            var (studentInCourseId, _) = await CreateAndRegisterUser();
            var (anotherLectureId, _) = await CreateAndRegisterLecture();
            var (anotherStudentId, _) = await CreateAndRegisterUser();
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var courseLectureClient = CreateCourseServiceClient(courseLectureId);
            var studentInCourseClient = CreateCourseServiceClient(studentInCourseId);
            var anotherLectureClient = CreateCourseServiceClient(anotherLectureId);
            var anotherStudentClient = CreateCourseServiceClient(anotherStudentId);
            var courseId = await courseLectureClient.CreateCourse(newCourseViewModel, courseLectureId);
            await studentInCourseClient.SignInCourse(courseId, studentInCourseId);
            await courseLectureClient.AcceptStudent(courseId, studentInCourseId);
            // Act
            await anotherStudentClient.SignInCourse(courseId, anotherStudentId);
            var responseForStudentInCourse = await studentInCourseClient.AcceptStudent(courseId, anotherStudentId);
            var responseForAnotherStudent = await anotherStudentClient.AcceptStudent(courseId, anotherStudentId);
            var responseForAnotherLecture = await anotherLectureClient.AcceptStudent(courseId, anotherStudentId);
            //Assert
            responseForAnotherLecture.Succeeded.Should().BeFalse();
            responseForAnotherStudent.Succeeded.Should().BeFalse();
            responseForStudentInCourse.Succeeded.Should().BeFalse();
        }
    }
}