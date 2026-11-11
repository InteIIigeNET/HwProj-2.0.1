using System;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
using HwProj.NotificationService.Events.SolutionsService;
using HwProj.SolutionsService.API;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using SolutionRatingService = HwProj.SolutionsService.API.Services.SolutionsService;

namespace HwProj.SolutionsService.IntegrationTests
{
    [TestFixture]
    public class RequiresRevisionTests
    {
        [TestCase(true)]
        [TestCase(false)]
        public void RevisionFlagSurvivesDtoAndGatewayResponse(bool requiresRevision)
        {
            var mapper = new MapperConfiguration(c => c.AddProfile<AutomapperProfile>()).CreateMapper();
            var entity = new Solution
            {
                Id = 42, Rating = 7, State = SolutionState.Rated, RequiresRevision = requiresRevision
            };

            // Solutions Service использует AutoMapper для списков и статистики.
            var dto = mapper.Map<SolutionDto>(entity);
            Assert.That(dto.RequiresRevision, Is.EqualTo(requiresRevision));

            // Отдельное решение возвращается как Solution, а клиент Gateway читает SolutionDto.
            var received = JsonConvert.DeserializeObject<SolutionDto>(JsonConvert.SerializeObject(entity))
                ?? throw new InvalidOperationException("Solution response was not deserialized");
            Assert.That(received.RequiresRevision, Is.EqualTo(requiresRevision));
            var response = new GetSolutionModel(received, null, null);
            var json = JObject.Parse(JsonConvert.SerializeObject(response, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            }));
            Assert.That(json["requiresRevision"], Is.Not.Null);
            Assert.That(json.Value<bool>("requiresRevision"), Is.EqualTo(requiresRevision));
            Assert.That(json.Value<int>("rating"), Is.EqualTo(7));
            Assert.That(response.State, Is.EqualTo(SolutionState.Rated));
        }

        [TestCase(true, false, 7, SolutionState.Rated)]
        [TestCase(false, true, 10, SolutionState.Final)]
        [TestCase(true, false, 0, SolutionState.Rated)]
        public async Task RatingPassesNewFlagToRepositoryAndEvent(bool requested, bool previous,
            int rating, SolutionState expectedState)
        {
            var repository = new Mock<ISolutionsRepository>();
            repository.Setup(r => r.GetAsync(42)).ReturnsAsync(new Solution
            {
                Id = 42, TaskId = 5, RequiresRevision = previous
            });
            repository.Setup(r => r.RateSolutionAsync(42, expectedState, "lecturer", rating,
                It.IsAny<DateTime>(), "comment", requested)).Returns(Task.CompletedTask);
            var courses = new Mock<ICoursesServiceClient>();
            courses.Setup(c => c.GetTask(5, false)).ReturnsAsync(new HomeworkTaskViewModel { MaxRating = 10 });
            var events = new Mock<IEventBus>();
            var mapper = new MapperConfiguration(c => c.AddProfile<AutomapperProfile>()).CreateMapper();
            var service = new SolutionRatingService(repository.Object, events.Object, mapper, courses.Object,
                Mock.Of<IAuthServiceClient>(), Mock.Of<IGithubSolutionCommitsRepository>(),
                Mock.Of<IConfiguration>());

            await service.RateSolutionAsync(42, "lecturer", rating, "comment", requested);

            repository.Verify(r => r.RateSolutionAsync(42, expectedState, "lecturer", rating,
                It.IsAny<DateTime>(), "comment", requested), Times.Once);
            events.Verify(e => e.Publish(It.Is<RateEvent>(value =>
                value.Solution.RequiresRevision == requested && value.Solution.Rating == rating)), Times.Once);
        }

        [Test]
        public void EmptySolutionMappingPreservesFlag()
        {
            var mapper = new MapperConfiguration(c => c.AddProfile<AutomapperProfile>()).CreateMapper();
            var solution = mapper.Map<Solution>(new SolutionViewModel { RequiresRevision = true });
            Assert.That(solution.RequiresRevision, Is.True);
        }

        [Test, Category("LocalDatabase")]
        public async Task RepositoryCanSetAndClearFlagWithoutChangingOtherSolutionData()
        {
            var options = new DbContextOptionsBuilder<SolutionContext>().UseSqlServer(
                "Server=(localdb)\\mssqllocaldb;Database=SolutionsServiceDB;Trusted_Connection=True;").Options;
            using (var context = new SolutionContext(options))
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                // Все изменения теста откатываются, реальные решения не обновляются.
                var repository = new SolutionsRepository(context);
                var id = await repository.AddAsync(new Solution
                {
                    TaskId = 0, StudentId = "revision-persistence-test", Comment = "original submission",
                    PublicationDate = DateTime.UtcNow, State = SolutionState.Posted
                });
                foreach (var requiresRevision in new[] { true, false })
                {
                    await repository.RateSolutionAsync(id, SolutionState.Rated, "test-lecturer", 7,
                        DateTime.UtcNow, "teacher comment", requiresRevision);
                    var saved = await context.Solutions.AsNoTracking().SingleAsync(s => s.Id == id);
                    Assert.That(saved.RequiresRevision, Is.EqualTo(requiresRevision));
                    Assert.That(saved.Rating, Is.EqualTo(7));
                    Assert.That(saved.Comment, Is.EqualTo("original submission"));
                    Assert.That(saved.LecturerComment, Is.EqualTo("teacher comment"));
                }
                transaction.Rollback();
            }
        }
    }
}
