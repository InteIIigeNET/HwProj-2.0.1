using HwProj.CoursesService.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using NUnit.Framework;
using HwProj.CoursesService.API.Services;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.API;
using AutoMapper;
using System.Threading.Tasks;

namespace HwProj.CoursesService.Tests
{
    [TestFixture]
    public class GroupsServiceTests
    {
        private CourseContext _courseContext;
        private GroupsRepository _groupsRepository;
        private GroupMatesRepository _groupMatesRepository;
        private GroupsService _service;

        [SetUp]
        public void Setup()
        {
            var connectionString = "Server=(localdb)\\mssqllocaldb;Database=GroupsServiceDB;Trusted_Connection=True;";
            var builder = new DbContextOptionsBuilder();
            var options = builder.UseSqlServer(connectionString).Options;
            _courseContext = new CourseContext(options);
            _groupsRepository = new GroupsRepository(_courseContext);
            _groupMatesRepository = new GroupMatesRepository(_courseContext);
            var config = new MapperConfiguration(cfg => new ApplicationProfile());
            IMapper iMapper = config.CreateMapper();
            _service = new GroupsService(_groupsRepository, _groupMatesRepository, iMapper);
        }

        [Test]
        public async Task GetGroupTest()
        {
            var gr = new Group {CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o"};
            await _groupsRepository.AddAsync(gr);
            Group ans = await _service.GetGroupAsync(1);
            Assert.AreEqual(gr.CourseId, ans.CourseId);
            Assert.AreEqual(gr.GroupMates, ans.GroupMates);
            Assert.AreEqual(gr.Name, ans.Name);
        }

        [TearDown]
        public void CleanUp()
        {
            _courseContext.Dispose();
        }
    }
}
