using HwProj.CoursesService.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using NUnit.Framework;
using HwProj.CoursesService.API.Services;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.API;
using AutoMapper;
using System.Threading.Tasks;
using System.Linq;

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
            var id = await _groupsRepository.AddAsync(gr);
            Group ans = await _service.GetGroupAsync(id);
            Assert.AreEqual(gr.CourseId, ans.CourseId);
            Assert.AreEqual(gr.GroupMates, ans.GroupMates);
            Assert.AreEqual(gr.Name, ans.Name);
            await _groupsRepository.DeleteAsync(id);
        }

        [Test]
        public async Task GetGroupWithMatesTest()
        {
            var gr = new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o" };
            var id = await _groupsRepository.AddAsync(gr);

            var mates = new List<GroupMate>
            {
                new GroupMate{GroupId = id, StudentId = "st1"},
                new GroupMate{GroupId = id, StudentId = "st2"},
                new GroupMate{GroupId = id, StudentId = "st3"}
            };

            _courseContext.AddRange(mates);
            _courseContext.SaveChanges();

            Group ans = await _service.GetGroupAsync(id);
            Assert.AreEqual(gr.CourseId, ans.CourseId);
            Assert.AreEqual(gr.Name, ans.Name);
            mates.ForEach(cm => Assert.IsNotNull(ans.GroupMates.Find(c => c.StudentId == cm.StudentId)));

            _courseContext.RemoveRange(mates);
            _courseContext.SaveChanges();
        }

        [TearDown]
        public void CleanUp()
        {
            foreach (var entity in _courseContext.GroupMates)
                _courseContext.GroupMates.Remove(entity);
            foreach (var entity in _courseContext.Groups)
                _courseContext.Groups.Remove(entity);
            _courseContext.SaveChanges();
            _courseContext.Dispose();
        }
    }
}
