using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoFixture;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using FluentAssertions;
using HwProj.Exceptions;

namespace HwProj.SolutionsService.IntegrationTests
{
    [TestFixture]
    public class SolutionsServiceTests
    {
        private RegisterViewModel GenerateRegisterViewModel()
        {
            var password = new Fixture().Create<string>();
            var fixture = new Fixture().Build<RegisterViewModel>();
              //  .With(vm => vm.Password, password)
              //  .With(vm => vm.PasswordConfirm, password);
            var viewModel = fixture.Create();
            viewModel.Email += "@mail.ru";
            return viewModel;
        }

        private AuthServiceClient CreateAuthServiceClient()
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration.Setup(x => x.GetSection("Services")["Auth"]).Returns("http://localhost:5001");
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory.Setup(x => x.CreateClient(Options.DefaultName)).Returns(new HttpClient());
            return new AuthServiceClient(mockClientFactory.Object, mockIConfiguration.Object);
        }

        private CreateCourseViewModel GenerateCreateCourseViewModel()
        {
            var fixture = new Fixture().Build<CreateCourseViewModel>()
                .With(cvm => cvm.IsOpen, true);
            return fixture.Create();
        }

        private CreateHomeworkViewModel GenerateCreateHomeworkViewModel()
        {
            const int daysDifference = 5;
            const int hoursDifference = 10;
            const int addYears = 1;
            
            var fixture = new Fixture();
            fixture.Customizations.Add(new RandomDateTimeSequenceGenerator(DateTime.UtcNow, DateTime.UtcNow.AddYears(addYears)));

            var result = fixture.Build<CreateHomeworkViewModel>()
                .With(hvm => hvm.Tasks, new List<CreateTaskViewModel>())
                .With(hvm => hvm.PublicationDate, DateTime.UtcNow)
                .Without(hvm => hvm.DeadlineDate)
                .Without(hvm => hvm.PublicationDate)
                .Do(hvm =>
                {
                    hvm.PublicationDate = fixture.Create<DateTime>();
                    hvm.DeadlineDate = hvm.PublicationDate.AddDays(daysDifference).AddHours(hoursDifference);
                });
            
            return result.Create();
        }

        private CreateTaskViewModel GenerateCreateTaskViewModelWithoutDeadLine()
        {
            return new Fixture().Build<CreateTaskViewModel>()
                .With(t => t.HasDeadline, false)
                .Without(t => t.IsDeadlineStrict)
                .Without(t => t.PublicationDate)
                .Without(t => t.DeadlineDate)
                .Create();
        }

        private CreateTaskViewModel GenerateCreateTaskViewModelWithStrictDeadLine()
        {
            return new Fixture().Build<CreateTaskViewModel>()
                .With(t => t.HasDeadline, true)
                .With(t => t.IsDeadlineStrict, true)
                .With(t => t.PublicationDate, DateTime.UtcNow)
                .With(t => t.DeadlineDate, DateTime.UtcNow)
                .Create();
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

        private async Task<(string, string)> CreateAndRegisterUser()
        {
            var authClient = CreateAuthServiceClient();
            var userData = GenerateRegisterViewModel();
            await authClient.Register(userData);
            var userId = await authClient.FindByEmailAsync(userData.Email);
            return (userId, userData.Email);
        }

        private (string, string)[] CreateAndRegisterUsers(int amount)
        {
            return Enumerable.Repeat(0, amount).Select(_ => CreateAndRegisterUser().Result).ToArray();
        }

        private async Task<(string, string)> CreateAndRegisterLecture()
        {
            var (userId, mail) = await CreateAndRegisterUser();
            var authClient = CreateAuthServiceClient();
            await authClient.InviteNewLecturer(new InviteLecturerViewModel() { Email = mail });
            return (userId, mail);
        }

        private async Task<long> CreateCourse(CoursesServiceClient courseClient, string userId)
        {
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var courseId = await courseClient.CreateCourse(newCourseViewModel);
            return courseId.Value;
        }

        private async Task SignStudentInCourse(
            CoursesServiceClient studentCourseClient,
            CoursesServiceClient lectureCourseClient,
            long courseId,
            string studentId)
        {
            await studentCourseClient.SignInCourse(courseId, studentId);
            await lectureCourseClient.AcceptStudent(courseId, studentId);
        }

        private PostSolutionModel GenerateSolutionViewModel(string userId)
        {
            var url = new Fixture().Create<string>();
            var fixture = new Fixture().Build<PostSolutionModel>()
                .With(h => h.GithubUrl, url)
                .With(h => h.StudentId, userId);
            var viewModel = fixture.Create();
            viewModel.GroupId = null;
            return viewModel;
        }

        private PostSolutionModel GenerateGroupSolutionViewModel(string userId, long groupId)
        {
            var url = new Fixture().Create<string>();
            var fixture = new Fixture().Build<PostSolutionModel>()
                .With(h => h.GithubUrl, url)
                .With(h => h.StudentId, userId)
                .With(h => h.GroupId, groupId);
            var viewModel = fixture.Create();
            return viewModel;
        }

        private SolutionsServiceClient CreateSolutionsServiceClient(string userId)
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration.Setup(x => x.GetSection("Services")["Solutions"]).Returns("http://localhost:5007");
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory.Setup(x => x.CreateClient(Options.DefaultName)).Returns(new HttpClient());
            var mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            mockHttpContextAccessor.Setup(x => x.HttpContext.User.FindFirst("_id")).Returns(new Claim("", userId));
            return new SolutionsServiceClient(mockClientFactory.Object, mockHttpContextAccessor.Object,
                mockIConfiguration.Object);
        }

        private async Task<(string, string)> CreateUserAndLecture()
        {
            var (studentId, _) = await CreateAndRegisterUser();
            var (lectureId, _) = await CreateAndRegisterLecture();
            return (studentId, lectureId);
        }

        private async Task<(long, long, long)> CreateCourseHomeworkTaskWithOutDeadLine(
            CoursesServiceClient lectureCourseClient, string lectureId)
        {
            var courseId = await CreateCourse(lectureCourseClient, lectureId);
            var newHomeworkViewModel = GenerateCreateHomeworkViewModel();
            var newTaskViewModel = GenerateCreateTaskViewModelWithoutDeadLine();
            var homework = await lectureCourseClient.AddHomeworkToCourse(newHomeworkViewModel, courseId);
            var task = await lectureCourseClient.AddTask(homework.Value.Id, newTaskViewModel);
            return (courseId, homework.Value.Id, task.Value.Id);
        }

        [Test, Explicit]
        public async Task PostByStudentNotFromThisCourseTest()
        {
            var (studentId, lectureId) = await CreateUserAndLecture();
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var (courseId, homeworkId, taskId) =
                await CreateCourseHomeworkTaskWithOutDeadLine(lectureCourseClient, lectureId);
            var solutionClient = CreateSolutionsServiceClient(studentId);
            var solutionViewModel = GenerateSolutionViewModel(studentId);

            Assert.ThrowsAsync<ForbiddenException>(async () =>
                await solutionClient.PostSolution(taskId, solutionViewModel));
        }

        [Test]
        public async Task PostAndGetSolutionByIdTest()
        {
            var (studentId, lectureId) = await CreateUserAndLecture();
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var (courseId, homeworkId, taskId) =
                await CreateCourseHomeworkTaskWithOutDeadLine(lectureCourseClient, lectureId);
            await SignStudentInCourse(studentCourseClient, lectureCourseClient, courseId, studentId);
            var solutionClient = CreateSolutionsServiceClient(studentId);
            var solutionViewModel = GenerateSolutionViewModel(studentId);

            var solutionId = await solutionClient.PostSolution(taskId, solutionViewModel);
            var solutionIdGet = await solutionClient.GetSolutionById(solutionId);

            solutionIdGet.Id.Should().Be(solutionId);
            solutionIdGet.Comment.Should().Be(solutionViewModel.Comment);
            solutionIdGet.Comment.Should().Be(solutionViewModel.Comment);
            solutionIdGet.Comment.Should().Be(solutionViewModel.Comment);
        }

        [Test]
        public async Task PostAndGetUserSolutionTest()
        {
            var (studentId, lectureId) = await CreateUserAndLecture();
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var (courseId, homeworkId, taskId) =
                await CreateCourseHomeworkTaskWithOutDeadLine(lectureCourseClient, lectureId);
            await SignStudentInCourse(studentCourseClient, lectureCourseClient, courseId, studentId);
            var solutionClient = CreateSolutionsServiceClient(studentId);
            var solutionViewModel1 = GenerateSolutionViewModel(studentId);
            var solutionViewModel2 = GenerateSolutionViewModel(studentId);

            var solutionId1 = await solutionClient.PostSolution(taskId, solutionViewModel1);
            var solutionId2 = await solutionClient.PostSolution(taskId, solutionViewModel2);
            var solutionIdGet = await solutionClient.GetUserSolutions(taskId, studentId);

            solutionIdGet.Should().HaveCount(2);
            solutionIdGet.Should().ContainSingle(s => s.Id == solutionId1);
            solutionIdGet.Should().ContainSingle(s => s.Id == solutionId2);
        }

        [Test]
        public async Task PostAndGetAllSolutionTest()
        {
            var (studentId1, lectureId) = await CreateUserAndLecture();
            var (studentId2, _) = await CreateAndRegisterUser();
            var student1CourseClient = CreateCourseServiceClient(studentId1);
            var student2CourseClient = CreateCourseServiceClient(studentId2);
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var (courseId, homeworkId, taskId) =
                await CreateCourseHomeworkTaskWithOutDeadLine(lectureCourseClient, lectureId);
            await SignStudentInCourse(student1CourseClient, lectureCourseClient, courseId, studentId1);
            await SignStudentInCourse(student2CourseClient, lectureCourseClient, courseId, studentId2);
            var solutionClient = CreateSolutionsServiceClient(lectureId);
            var solutionClient1 = CreateSolutionsServiceClient(studentId1);
            var solutionClient2 = CreateSolutionsServiceClient(studentId2);
            var solutionViewModelFromStudent1 = GenerateSolutionViewModel(studentId1);
            var solutionViewModelFromStudent2 = GenerateSolutionViewModel(studentId2);

            var solutionIdFromStudent1 = await solutionClient1.PostSolution(taskId, solutionViewModelFromStudent1);
            var solutionIdFromStudent2 = await solutionClient2.PostSolution(taskId, solutionViewModelFromStudent2);
            var solutionsGet = await solutionClient.GetAllSolutions();

            solutionsGet.Should().ContainSingle(s => s.Id == solutionIdFromStudent1);
            solutionsGet.Should().ContainSingle(s => s.Id == solutionIdFromStudent2);
        }

        [Test]
        public async Task RateSolutionByLectureTest()
        {
            var (studentId, lectureId) = await CreateUserAndLecture();
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var (courseId, homeworkId, taskId) =
                await CreateCourseHomeworkTaskWithOutDeadLine(lectureCourseClient, lectureId);
            await SignStudentInCourse(studentCourseClient, lectureCourseClient, courseId, studentId);
            var lectureClient = CreateSolutionsServiceClient(lectureId);
            var solutionClient = CreateSolutionsServiceClient(studentId);
            var solutionViewModelFromStudent = GenerateSolutionViewModel(studentId);

            var solutionId = await solutionClient.PostSolution(taskId, solutionViewModelFromStudent);
            var rateSolutionModel = new RateSolutionModel()
            {
                Rating = 2, LecturerComment = "Not Bad"
            };
            await lectureClient.RateSolution(solutionId, rateSolutionModel);
            var solutionsGet = await solutionClient.GetSolutionById(solutionId);

            solutionsGet.LecturerComment.Should().Be("Not Bad");
            solutionsGet.Rating.Should().Be(2);
        }

        [Test]
        public async Task RateSolutionByNotLectureTest()
        {
            var (studentId, lectureId) = await CreateUserAndLecture();
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var (courseId, homeworkId, taskId) =
                await CreateCourseHomeworkTaskWithOutDeadLine(lectureCourseClient, lectureId);
            await SignStudentInCourse(studentCourseClient, lectureCourseClient, courseId, studentId);
            var solutionClient = CreateSolutionsServiceClient(studentId);
            var solutionViewModelFromStudent = GenerateSolutionViewModel(studentId);

            var solutionId = await solutionClient.PostSolution(taskId, solutionViewModelFromStudent);
            var rateSolutionModel = new RateSolutionModel()
            {
                Rating = 2, LecturerComment = "Not Bad",
            };
            Assert.ThrowsAsync<ForbiddenException>(async () =>
                await solutionClient.RateSolution(solutionId, rateSolutionModel));
        }


        [Test]
        public async Task MarkSolutionTest()
        {
            var (studentId, lectureId) = await CreateUserAndLecture();
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var (courseId, homeworkId, taskId) =
                await CreateCourseHomeworkTaskWithOutDeadLine(lectureCourseClient, lectureId);
            await SignStudentInCourse(studentCourseClient, lectureCourseClient, courseId, studentId);
            var solutionClient = CreateSolutionsServiceClient(studentId);
            var solutionViewModelFromStudent = GenerateSolutionViewModel(studentId);

            var solutionId = await solutionClient.PostSolution(taskId, solutionViewModelFromStudent);
            await solutionClient.MarkSolution(solutionId);
            var solutionsGet = await solutionClient.GetSolutionById(solutionId);

            solutionsGet.State.Should().Be(SolutionState.Final);
        }

        [Test]
        public async Task DeleteSolutionTest()
        {
            var (studentId, lectureId) = await CreateUserAndLecture();
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var (courseId, homeworkId, taskId) =
                await CreateCourseHomeworkTaskWithOutDeadLine(lectureCourseClient, lectureId);
            await SignStudentInCourse(studentCourseClient, lectureCourseClient, courseId, studentId);
            var solutionClient = CreateSolutionsServiceClient(studentId);
            var solutionViewModel = GenerateSolutionViewModel(studentId);

            var solutionId = await solutionClient.PostSolution(taskId, solutionViewModel);
            var solutionIdBefore = await solutionClient.GetSolutionById(solutionId);
            await solutionClient.DeleteSolution(solutionId);
            var solutionIdAfter = await solutionClient.GetUserSolutions(taskId, studentId);

            solutionIdBefore.Id.Should().Be(solutionId);
            solutionIdAfter.Should().NotContain(s => s.Id == solutionIdBefore.Id);
        }

        [Test]
        public async Task GetCourseStatisticsTest()
        {
            var (studentId, lectureId) = await CreateUserAndLecture();
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var (courseId, homeworkId, taskId) =
                await CreateCourseHomeworkTaskWithOutDeadLine(lectureCourseClient, lectureId);
            await SignStudentInCourse(studentCourseClient, lectureCourseClient, courseId, studentId);
            var solutionClient = CreateSolutionsServiceClient(lectureId);
            var solutionViewModel = GenerateSolutionViewModel(studentId);

            var solutionId = await solutionClient.PostSolution(taskId, solutionViewModel);
            var rateSolutionModel = new RateSolutionModel()
            {
                Rating = 2, LecturerComment = "Not Bad"
            };
            await solutionClient.RateSolution(solutionId, rateSolutionModel);
            var statisticsFromStudent = await solutionClient.GetCourseStatistics(courseId, studentId);
            var statisticsFromLecture = await solutionClient.GetCourseStatistics(courseId, lectureId);

            statisticsFromStudent.Should().HaveCount(1);
            statisticsFromLecture.Should().HaveCount(1);
            statisticsFromLecture[0].Homeworks.Should().HaveCount(1);
            statisticsFromLecture[0].Homeworks[0].Tasks.Should().HaveCount(1);
            statisticsFromLecture[0].Homeworks[0].Tasks[0].Solution.Should().HaveCount(1);
            statisticsFromLecture[0].Homeworks[0].Tasks[0].Solution[0].Rating.Should().Be(2);
        }

        [Test]
        public async Task PostSolutionAfterNotStrictDeadLine()
        {
            var (studentId, lectureId) = await CreateUserAndLecture();
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var courseId = await CreateCourse(lectureCourseClient, lectureId);
            var homeworkViewModel = GenerateCreateHomeworkViewModel();
            var homework = await lectureCourseClient.AddHomeworkToCourse(homeworkViewModel, courseId);
            var taskViewModel = GenerateCreateTaskViewModelWithStrictDeadLine();
            taskViewModel.IsDeadlineStrict = false;
            var task = await lectureCourseClient.AddTask(homework.Value.Id, taskViewModel);
            await SignStudentInCourse(studentCourseClient, lectureCourseClient, courseId, studentId);
            var solutionsClient = CreateSolutionsServiceClient(studentId);

            var solutionViewModel = GenerateSolutionViewModel(studentId);
            solutionViewModel.PublicationDate = DateTime.MaxValue;

            var solutionId = await solutionsClient.PostSolution(task.Value.Id, solutionViewModel);
            var solutionIdGet = await solutionsClient.GetUserSolutions(task.Value.Id, studentId);

            solutionIdGet.Should().HaveCount(1);
            solutionIdGet.Should().Contain(s => s.Id == solutionId);
        }

        [Test]
        public async Task PostSolutionAfterStrictDeadLine()
        {
            var (studentId, lectureId) = await CreateUserAndLecture();
            var studentCourseClient = CreateCourseServiceClient(studentId);
            var lectureCourseClient = CreateCourseServiceClient(lectureId);
            var courseId = await CreateCourse(lectureCourseClient, lectureId);
            var homeworkViewModel = GenerateCreateHomeworkViewModel();
            var homework = await lectureCourseClient.AddHomeworkToCourse(homeworkViewModel, courseId);
            var taskViewModel = GenerateCreateTaskViewModelWithStrictDeadLine();
            var task = await lectureCourseClient.AddTask(homework.Value.Id, taskViewModel);
            await SignStudentInCourse(studentCourseClient, lectureCourseClient, courseId, studentId);
            var solutionsClient = CreateSolutionsServiceClient(studentId);

            var solutionViewModel = GenerateSolutionViewModel(studentId);
            solutionViewModel.PublicationDate = DateTime.MaxValue;

            Assert.ThrowsAsync<ForbiddenException>(async () =>
                await solutionsClient.PostSolution(task.Value.Id, solutionViewModel));
        }

        [Test]
        public async Task GetTaskSolutionStatisticsTest()
        {
            var lecturer = await CreateAndRegisterLecture();
            var lectureCourseClient = CreateCourseServiceClient(lecturer.Item1);
            var students = CreateAndRegisterUsers(3);
            var studentsIds = students.Select(s => s.Item1).ToArray();
            var studentsCourseClients = studentsIds.Select(CreateCourseServiceClient).ToArray();

            var (courseId, homeworkId, taskId) =
                await CreateCourseHomeworkTaskWithOutDeadLine(lectureCourseClient, lecturer.Item1);
            await SignStudentInCourse(studentsCourseClients[0], lectureCourseClient, courseId, studentsIds[0]);
            await SignStudentInCourse(studentsCourseClients[1], lectureCourseClient, courseId, studentsIds[1]);
            await SignStudentInCourse(studentsCourseClients[2], lectureCourseClient, courseId, studentsIds[2]);

            var solutionClients = studentsIds.Select(CreateSolutionsServiceClient).ToArray();
            var solutionClient = CreateSolutionsServiceClient(lecturer.Item1);

            var group1ViewModel = new CreateGroupViewModel(studentsIds, courseId);
            var group1Id = await lectureCourseClient.CreateCourseGroup(group1ViewModel, courseId);
            var group2ViewModel = new CreateGroupViewModel(new string[] { studentsIds[0], studentsIds[1] }, courseId);
            var group2Id = await lectureCourseClient.CreateCourseGroup(group2ViewModel, courseId);

            var solution1ViewModel = GenerateGroupSolutionViewModel(studentsIds[0], group1Id);
            var solution1Id = await solutionClients[0].PostSolution(taskId, solution1ViewModel);
            var rateSolutionModel = new RateSolutionModel()
            {
                Rating = 1, LecturerComment = "Group"
            };
            await solutionClient.RateSolution(solution1Id, rateSolutionModel);
            var postSolutionRatingModelTwo = new RateSolutionModel()
            {
                Rating = 2, LecturerComment = "Pair"
            };
            var solution2ViewModel = GenerateGroupSolutionViewModel(studentsIds[1], group2Id);
            var solution2Id = await solutionClients[1].PostSolution(taskId, solution2ViewModel);
            await solutionClient.RateSolution(solution2Id, postSolutionRatingModelTwo);
            var postSolutionRatingModelThree = new RateSolutionModel()
            {
                Rating = 3, LecturerComment = "Individual"
            };
            var solution3ViewModel = GenerateSolutionViewModel(studentsIds[1]);
            var solution3Id = await solutionClients[1].PostSolution(taskId, solution3ViewModel);
            await solutionClient.RateSolution(solution3Id, postSolutionRatingModelThree);

            var response = await solutionClient.GetTaskSolutionStatistics(courseId, taskId);
            var firstStudentSolutions = response.First(s => s.StudentId == studentsIds[0]).Solutions;
            var secondStudentSolutions = response.First(s => s.StudentId == studentsIds[1]).Solutions;
            var thirdStudentSolutions = response.First(s => s.StudentId == studentsIds[2]).Solutions;

            response.Should().HaveCount(3);
            firstStudentSolutions.Should().HaveCount(2);
            secondStudentSolutions.Should().HaveCount(3);
            thirdStudentSolutions.Should().HaveCount(1);
            firstStudentSolutions.Select(s => s.LecturerComment).ToArray()
                .Should().BeEquivalentTo("Group", "Pair");
            secondStudentSolutions.Select(s => s.LecturerComment).ToArray()
                .Should().BeEquivalentTo("Group", "Pair", "Individual");
            thirdStudentSolutions.Select(s => s.LecturerComment).ToArray()
                .Should().BeEquivalentTo("Group");
        }
    }
}