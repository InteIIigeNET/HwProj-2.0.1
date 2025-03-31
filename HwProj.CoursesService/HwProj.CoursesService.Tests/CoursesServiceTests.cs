using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoFixture;
using HwProj.AuthService.Client;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using FluentAssertions;
using HwProj.CoursesService.Client;
using HwProj.Models.Result;

namespace HwProj.CoursesService.Tests
{
    [TestFixture]
    public class CoursesServiceTests
    {
        private CoursesServiceClient client = null!;

        private long courseId;

        private static DateTime utcNow = DateTime.UtcNow;
        
        private static RegisterViewModel GenerateRegisterViewModel()
        {
            var password = new Fixture().Create<string>();
            var fixture = new Fixture().Build<RegisterViewModel>();
             //   .With(vm => vm.Password, password)
              //  .With(vm => vm.PasswordConfirm, password);
            var viewModel = fixture.Create();
            viewModel.Email += "@mail.ru";
            return viewModel;
        }

        private static AuthServiceClient CreateAuthServiceClient()
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration.Setup(x => x.GetSection("Services")["Auth"]).Returns("http://localhost:5001");
            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory.Setup(x => x.CreateClient(Options.DefaultName)).Returns(new HttpClient());
            return new AuthServiceClient(mockClientFactory.Object, mockIConfiguration.Object);
        }

        private static CreateCourseViewModel GenerateCreateCourseViewModel()
        {
            var fixture = new Fixture().Build<CreateCourseViewModel>()
                .With(cvm => cvm.IsOpen, true);
            return fixture.Create();
        }

        private static CreateHomeworkViewModel GenerateCreateHomeworkViewModel(DateTime publicationDate,
            bool hasDeadline, DateTime? deadlineDate, bool isStrict, List<CreateTaskViewModel>? tasks = null)
            => new Fixture().Build<CreateHomeworkViewModel>()
                    .With(hvc => hvc.HasDeadline, hasDeadline)
                    .With(hvc => hvc.PublicationDate, publicationDate)
                    .With(hvc => hvc.DeadlineDate, deadlineDate)
                    .With(hvc => hvc.IsDeadlineStrict, isStrict)
                    .With(hvm => hvm.Tasks, tasks ?? new List<CreateTaskViewModel>())
                    .Create();

        private static CreateHomeworkViewModel GenerateDefaultHomeworkViewModel()
            => GenerateCreateHomeworkViewModel(utcNow, false, null, false);
        
        private static CreateTaskViewModel GenerateCreateTaskViewModel(DateTime? publicationDate,
            bool? hasDeadline, DateTime? deadlineDate, bool? isStrict)
            => new Fixture().Build<CreateTaskViewModel>()
                .With(hvc => hvc.HasDeadline, hasDeadline)
                .With(hvc => hvc.PublicationDate, publicationDate)
                .With(hvc => hvc.DeadlineDate, deadlineDate)
                .With(hvc => hvc.IsDeadlineStrict, isStrict)
                .Create();

        private static CreateTaskViewModel GenerateDefaultTaskViewModel()
            => GenerateCreateTaskViewModel(null, null, null, null);

        private static CreateTaskViewModel GenerateCreateTaskViewModelWithNullProperties()
        {
            return new Fixture().Build<CreateTaskViewModel>()
                .Without(t => t.PublicationDate)
                .Without(t => t.DeadlineDate)
                .Without(t => t.IsDeadlineStrict)
                .Without(t => t.HasDeadline)
                .Create();
        }

        private static CoursesServiceClient CreateCourseServiceClient(string userId)
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

        private static async Task<(string, string)> CreateAndRegisterUser()
        {
            var authClient = CreateAuthServiceClient();
            var userData = GenerateRegisterViewModel();
            await authClient.Register(userData);
            var userId = await authClient.FindByEmailAsync(userData.Email);
            return (userId, userData.Email);
        }
        
        private static async Task<(string userId, string mail)> CreateAndRegisterLecture()
        {
            var (userId, mail) = await CreateAndRegisterUser();
            var authClient = CreateAuthServiceClient();
            await authClient.InviteNewLecturer(new InviteLecturerViewModel() { Email = mail });
            return (userId, mail);
        }

        private static async Task<long> CreateCourse(CoursesServiceClient courseClient, string userId)
        {
            var newCourseViewModel = GenerateCreateCourseViewModel();
            var courseId = await courseClient.CreateCourse(newCourseViewModel);
            return courseId.Value;
        }

        private async Task<(long courseId, CoursesServiceClient client)> CreateClientAndCourse()
        {
            var lecturer = await CreateAndRegisterLecture();
            var lectureCourseClient = CreateCourseServiceClient(lecturer.Item1);
            var id = await CreateCourse(lectureCourseClient, lecturer.Item1);

            return (id, lectureCourseClient);
        }

        private async Task<(long courseId, CreateHomeworkViewModel homework, Result<long> homeworkResult, CoursesServiceClient client)> CreateCourseWithHomework()
        {
            var course = await CreateClientAndCourse();
            var homework = GenerateDefaultHomeworkViewModel();
            var homeworkResult = await course.client.AddHomeworkToCourse(homework, course.courseId);

            return (course.courseId, homework, homeworkResult, course.client);
        }
        
        private async Task<(Result editResult, HomeworkTaskForEditingViewModel tasksFromDb)> AddTaskToHomeworkAndUpdate(
            CreateTaskViewModel firstTaskState, CreateTaskViewModel secondTaskState)
        {
            var homework = GenerateDefaultHomeworkViewModel();
            var homeworkResult = await client.AddHomeworkToCourse(homework, courseId);
            var taskResult = await client.AddTask(homeworkResult.Value, firstTaskState);
            var editResult = await client.UpdateTask(taskResult.Value, secondTaskState);
            var taskFromDb = await client.GetForEditingTask(taskResult.Value);

            return (editResult, taskFromDb);
        }
        
        [OneTimeSetUp]
        public async Task SetUpAsync()
        {
            (courseId, client) = await CreateClientAndCourse();
        }

        [Test]
        public async Task NullTaskPropertiesAfterShouldBeInheritedFromHomework()
        {
            var expectedPublicationDate = utcNow;
            var expectedDeadlineDate = DateTime.MaxValue;
            const bool expectedHasDeadline = true;
            const bool expectedIsDeadlineStrict = false;
            var homework = new Fixture().Build<CreateHomeworkViewModel>()
                .With(hvc => hvc.HasDeadline, expectedHasDeadline)
                .With(hvc => hvc.PublicationDate, expectedPublicationDate)
                .With(hvc => hvc.DeadlineDate, expectedDeadlineDate)
                .With(hvc => hvc.IsDeadlineStrict, expectedIsDeadlineStrict)
                .With(hvc => hvc.Tasks, new List<CreateTaskViewModel> { GenerateCreateTaskViewModelWithNullProperties() })
                .Create();

            var homeworkResult = await client.AddHomeworkToCourse(homework, courseId);

            var actualResult = (await client.GetHomework(homeworkResult.Value)).Tasks.FirstOrDefault();

            homeworkResult.Succeeded.Should().BeTrue();
            homeworkResult.Errors.Should().BeNull();

            actualResult.Should().NotBeNull();
            actualResult?.HasDeadline.Should().Be(expectedHasDeadline);
            actualResult?.PublicationDate.Should().Be(expectedPublicationDate);
            actualResult?.DeadlineDate.Should().Be(expectedDeadlineDate);
            actualResult?.IsDeadlineStrict.Should().Be(expectedIsDeadlineStrict);
        }

        [TestCaseSource(nameof(InvalidCreateHomeworkData))]
        public async Task AddHomeworkWithInvalidPropertiesShouldReturnFailedResult((DateTime publication, bool hasDeadline, DateTime? deadline, bool isStrict, List<CreateTaskViewModel> tasks) data)
        {
            var homework = GenerateCreateHomeworkViewModel(data.publication, data.hasDeadline, data.deadline,
                data.isStrict, data.tasks);
            var homeworkResult = await client.AddHomeworkToCourse(homework, courseId);
            var course = await client.GetCourseById(courseId);

            course?.Homeworks.Should().NotContainEquivalentOf(homework, 
                options => options.ExcludingMissingMembers().Excluding(h => h.Tasks));
            homeworkResult.Succeeded.Should().BeFalse();
            homeworkResult.Errors.Should().NotBeEmpty();
        }

        [TestCaseSource(nameof(ValidCreateHomeworkData))]
        public async Task AddHomeworkWithValidPropertiesShouldReturnSucceededResult((DateTime publication, bool hasDeadline, DateTime? deadline, bool isStrict, List<CreateTaskViewModel>? tasks) data)
        {
            var homework = GenerateCreateHomeworkViewModel(data.publication, data.hasDeadline, data.deadline, data.isStrict, data.tasks);
            var homeworkResult = await client.AddHomeworkToCourse(homework, courseId);
            var course = await client.GetCourseById(courseId);
            
            homeworkResult.Succeeded.Should().BeTrue();
            homeworkResult.Errors.Should().BeNull();
            course?.Homeworks.Should().ContainEquivalentOf(homework,
                option => option.ExcludingMissingMembers().Excluding(h => h.Tasks));
        }
        
        [TestCaseSource(nameof(InvalidCreateTaskData))]
        public async Task AddTaskWithInvalidPropertiesShouldReturnFailedResult((CreateHomeworkViewModel homework, DateTime? publication, bool? hasDeadline, DateTime? deadline, bool? isStrict) data)
        {
            var task = GenerateCreateTaskViewModel(data.publication, data.hasDeadline, data.deadline, data.isStrict);
            var homeworkResult = await client.AddHomeworkToCourse(data.homework, courseId);
            var taskResult = await client.AddTask(homeworkResult.Value, task);
            var homeworkFromDb = await client.GetForEditingHomework(homeworkResult.Value);

            homeworkResult.Succeeded.Should().BeTrue();

            taskResult.Errors.Should().NotBeEmpty();
            taskResult.Succeeded.Should().BeFalse();
            homeworkFromDb.Tasks.Should()
                .NotContainEquivalentOf(task,
                    options => options.ExcludingMissingMembers());
        }

        [TestCaseSource(nameof(ValidCreateTaskData))]
        public async Task AddTaskWithValidPropertiesShouldReturnSucceededResult(
            (CreateHomeworkViewModel homework, DateTime? publication, bool? hasDeadline, DateTime? deadline, bool? isStrict) data)
        {
            var task = GenerateCreateTaskViewModel(data.publication, data.hasDeadline, data.deadline, data.isStrict);
            var homeworkResult = await client.AddHomeworkToCourse(data.homework, courseId);
            var taskResult = await client.AddTask(homeworkResult.Value, task);
            var homeworkFromDb = await client.GetForEditingHomework(homeworkResult.Value);

            homeworkResult.Succeeded.Should().BeTrue();

            taskResult.Errors.Should().BeNull();
            taskResult.Succeeded.Should().BeTrue();
            homeworkFromDb.Tasks.Should().NotBeNull();
            homeworkFromDb.Tasks.Should()
                .ContainEquivalentOf(task,
                    options => options.ExcludingMissingMembers());
        }

        [TestCaseSource(nameof(InvalidUpdateHomeworkData))]
        public async Task UpdateHomeworkWithInvalidPropertiesShouldReturnFailedResult(
            (CreateHomeworkViewModel firstHomeworkState, DateTime publication, bool hasDeadline, DateTime? deadline, bool isStrict) data)
        {
            var secondHomeworkState =
                GenerateCreateHomeworkViewModel(data.publication, data.hasDeadline, data.deadline, data.isStrict);
            var homeworkResult = await client.AddHomeworkToCourse(data.firstHomeworkState, courseId);
            var updateResult = await client.UpdateHomework(homeworkResult.Value, secondHomeworkState);
            var homeworkFromDb = await client.GetHomework(homeworkResult.Value);

            homeworkFromDb.Should().NotBeNull();
            homeworkResult.Succeeded.Should().BeTrue();

            updateResult.Errors.Should().NotBeEmpty();
            updateResult.Succeeded.Should().BeFalse();

            homeworkFromDb.Should().BeEquivalentTo(data.firstHomeworkState, 
                options => options.ExcludingMissingMembers().Excluding(h => h.Tasks));
        }

        [TestCaseSource(nameof(ValidUpdateHomeworkData))]
        public async Task UpdateHomeworkWithValidPropertiesShouldReturnSucceededResult(
            (CreateHomeworkViewModel firstHomeworkState,  DateTime publication, bool hasDeadline, DateTime? deadline, bool isStrict) data)
        {
            var secondHomeworkState =
                GenerateCreateHomeworkViewModel(data.publication, data.hasDeadline, data.deadline, data.isStrict);
            var homeworkResult = await client.AddHomeworkToCourse(data.firstHomeworkState, courseId);
            var updateResult = await client.UpdateHomework(homeworkResult.Value, secondHomeworkState);
            var taskFromDb = await client.GetHomework(homeworkResult.Value);
                
            taskFromDb.Should().NotBeNull();
            homeworkResult.Succeeded.Should().BeTrue();

            updateResult.Errors.Should().BeNull();
            updateResult.Succeeded.Should().BeTrue();

            taskFromDb.Should().BeEquivalentTo(secondHomeworkState, 
                options => options.ExcludingMissingMembers().Excluding(h => h.Tasks));
        }

        [Test]
        public async Task UpdateTaskPublicationDateAfterPublicationDateShouldReturnFailedResult()
        {
            var oldTaskState = GenerateCreateTaskViewModel(utcNow, null, null, null);
            var newTaskState = GenerateCreateTaskViewModel(utcNow.AddHours(1), null, null, null);

            var (editResult, taskFromDb) = await AddTaskToHomeworkAndUpdate(oldTaskState, newTaskState);

            editResult.Succeeded.Should().BeFalse();
            editResult.Errors.Should().NotBeEmpty();
            taskFromDb.Should().BeEquivalentTo(oldTaskState,
                options => options.ExcludingMissingMembers());
        }

        [Test]
        public async Task UpdateTaskPublicationDateWithValidPropertiesShouldReturnSucceededResult()
        {
            var oldTaskState = GenerateCreateTaskViewModel(utcNow, null, null, null);
            var newTaskState = GenerateCreateTaskViewModel(utcNow, true, utcNow, true);
            
            var (editResult, taskFromDb) = await AddTaskToHomeworkAndUpdate(oldTaskState, newTaskState);

            editResult.Succeeded.Should().BeTrue();
            editResult.Errors.Should().BeNull();
            taskFromDb.Should().BeEquivalentTo(newTaskState,
                options => options.ExcludingMissingMembers());
        }

        [Test]
        public async Task AddHomeworkByMentorNotFromThisCourseShouldReturnFailedResult()
        {
            var (newCourseId, _) = await CreateClientAndCourse();
            
            var homework = GenerateDefaultHomeworkViewModel();
            var addHomeworkResult = await client.AddHomeworkToCourse(homework, newCourseId);
            var courseFromDb = await client.GetCourseById(newCourseId);

            addHomeworkResult.Succeeded.Should().BeFalse();
            courseFromDb?.Homeworks.Should().BeEmpty();
        }
        
        [Test]
        public async Task AddTaskByMentorNotFromThisCourseShouldReturnFailedResult()
        {
            var (_, _, homeworkResult,  _) = await CreateCourseWithHomework();
            
            var task = GenerateDefaultTaskViewModel();
            var addHomeworkResult = await client.AddTask(homeworkResult.Value, task);
            var homeworkFromDb = await client.GetHomework(homeworkResult.Value);
            
            addHomeworkResult.Succeeded.Should().BeFalse();
            homeworkFromDb.Tasks.Should().BeEmpty();
        }

        [Test]
        public async Task UpdateHomeworkByMentorNotFromThisCourseShouldReturnFailedResult()
        {
            var (_, createdHomework, homeworkResult,  _) = await CreateCourseWithHomework();

            var homework = GenerateCreateHomeworkViewModel(utcNow.AddHours(2), true, utcNow.AddHours(4), true);
            var updateHomeworkResult = await client.UpdateHomework(homeworkResult.Value, homework);
            var homeworkFromDb = await client.GetHomework(homeworkResult.Value);
            
            updateHomeworkResult.Succeeded.Should().BeFalse();
            homeworkFromDb.Should().BeEquivalentTo(createdHomework,
                options => options.ExcludingMissingMembers());
        }

        [Test]
        public async Task UpdateTaskByMentorNotFromThisCourseShouldReturnFailedResult()
        {
            var (_, _, homeworkResult,  foreignClient) = await CreateCourseWithHomework();
            var oldTask = GenerateDefaultTaskViewModel();
            var newTask = GenerateCreateTaskViewModel(utcNow, false, null, false);

            var addTaskResult = await foreignClient.AddTask(homeworkResult.Value, oldTask);
            var updateTaskResult = await client.UpdateTask(addTaskResult.Value, newTask);
            var taskFromDb = await foreignClient.GetForEditingTask(addTaskResult.Value);
            
            updateTaskResult.Succeeded.Should().BeFalse();
            taskFromDb.Should().BeEquivalentTo(oldTask,
                options => options.ExcludingMissingMembers());
        }
        
        // TODO: тесты для GetForEditingTask/Homework

        public static IEnumerable<(DateTime publication, bool hasDeadline, DateTime? deadline, bool isStrict, List<CreateTaskViewModel>? tasks)> ValidCreateHomeworkData()
        {
            yield return (utcNow.AddHours(1), true, utcNow.AddHours(2), true, null);
            yield return (utcNow, false, null, false, null);
            yield return (utcNow, false, null, false,
                new List<CreateTaskViewModel> {GenerateCreateTaskViewModel(utcNow.AddHours(1), null, null, null)});
            yield return (utcNow, false, null, false, 
                new List<CreateTaskViewModel> {GenerateCreateTaskViewModel(null, null, null, null)});
            yield return (utcNow, false, null, false,
                new List<CreateTaskViewModel> {GenerateCreateTaskViewModel(utcNow, true, utcNow, false)});
            yield return (utcNow, false, null, false,
                new List<CreateTaskViewModel> {GenerateCreateTaskViewModel(utcNow, null, null, false)});
        }

        public static IEnumerable<(DateTime publication, bool hasDeadline, DateTime? deadline, bool isStrict, List<CreateTaskViewModel>? tasks)> InvalidCreateHomeworkData()
        {
            yield return (utcNow, false, utcNow, false, null);
            yield return (utcNow.AddHours(1), false, utcNow, false, null);
            yield return (utcNow, true, null, false, null);
            yield return (utcNow, false, null, true, null);
            yield return (utcNow, false, null, false,
                new List<CreateTaskViewModel> {GenerateCreateTaskViewModel(utcNow.AddHours(-1), null, null, null)});
            yield return (utcNow, false, null, false,
                new List<CreateTaskViewModel> {GenerateCreateTaskViewModel(utcNow, true, null, true)});
            yield return (utcNow, false, null, false,
                new List<CreateTaskViewModel> {GenerateCreateTaskViewModel(utcNow, null, null, true)});
        }

        public static IEnumerable<(CreateHomeworkViewModel, DateTime? publication, bool? hasDeadline, DateTime? deadline, bool? isStrict)> InvalidCreateTaskData()
        {
            var homeworkWithoutDeadline = GenerateCreateHomeworkViewModel(utcNow, false, null, false);
            var homeworkWithDeadline = GenerateCreateHomeworkViewModel(utcNow, true, utcNow.AddHours(3), false);

            yield return (homeworkWithoutDeadline, utcNow.AddHours(-1), null, null, null);
            yield return (homeworkWithoutDeadline, utcNow, null, utcNow, null);
            yield return (homeworkWithoutDeadline, utcNow, false, utcNow, null);
            yield return (homeworkWithoutDeadline, utcNow, true, null, null);
            yield return (homeworkWithoutDeadline, utcNow.AddHours(3), true, utcNow, null);
            yield return (homeworkWithoutDeadline, utcNow.AddHours(3), true, utcNow.AddHours(-1), null);
            yield return (homeworkWithoutDeadline, null, false, null, true);
            yield return (homeworkWithoutDeadline, null, null, null, true);
            yield return (homeworkWithDeadline, homeworkWithDeadline.DeadlineDate?.AddHours(1), null, null, null);
        }
        
        public static IEnumerable<(CreateHomeworkViewModel, DateTime? publication, bool? hasDeadline, DateTime? deadline, bool? isStrict)> ValidCreateTaskData()
        {
            var homeworkWithoutDeadline = GenerateCreateHomeworkViewModel(utcNow, false, null, false);
            var homeworkWithDeadline = GenerateCreateHomeworkViewModel(utcNow, true, utcNow.AddHours(3), false);

            yield return (homeworkWithoutDeadline, utcNow.AddHours(1), null, null, null);
            yield return (homeworkWithoutDeadline, null, null, null, null);
            yield return (homeworkWithoutDeadline, utcNow, true, utcNow, false);
            yield return (homeworkWithDeadline, null, false, null, false);
        } 

        public static IEnumerable<(CreateHomeworkViewModel firstState, DateTime publication, bool hasDeadline, DateTime? deadline, bool isStrict)> InvalidUpdateHomeworkData()
        { 
            var publishedHomework = GenerateCreateHomeworkViewModel(utcNow.AddHours(-1), false, null, false);
            var delayedHomework = GenerateCreateHomeworkViewModel(utcNow.AddHours(1), false, null, false,
                new List<CreateTaskViewModel> { GenerateCreateTaskViewModel(utcNow.AddHours(1), null, null, null)});

            yield return (publishedHomework, publishedHomework.PublicationDate.AddHours(1), true, utcNow, true);
            yield return (delayedHomework, delayedHomework.Tasks[0].PublicationDate?.AddHours(1) ?? utcNow, true,
                    utcNow, true);
        }
        
        public static IEnumerable<(CreateHomeworkViewModel firstState, DateTime publication, bool hasDeadline, DateTime? deadline, bool isStrict)> ValidUpdateHomeworkData()
        {
            var publishedHomework = GenerateCreateHomeworkViewModel(utcNow.AddHours(-1), false, null, false);
            var delayedHomework = GenerateCreateHomeworkViewModel(utcNow.AddHours(1), false, null, false,
                new List<CreateTaskViewModel> { GenerateCreateTaskViewModel(utcNow.AddHours(1), null, null, null)});

            yield return (publishedHomework, publishedHomework.PublicationDate, true, publishedHomework.PublicationDate, true);
            yield return (delayedHomework, delayedHomework.PublicationDate, true, utcNow.AddHours(10), true);
        }
    }
}