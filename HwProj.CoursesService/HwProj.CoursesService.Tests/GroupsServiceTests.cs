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

            _service = new GroupsService(_groupsRepository, _groupMatesRepository, _courseContext, iMapper);
        }

        [Test]
        public async Task GetGroupTest()
        {
            #region init data
            var group = new Group {CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o"};
            var addedGroupId = await _groupsRepository.AddAsync(group);
            var addedGroup = await _service.GetGroupAsync(addedGroupId).ConfigureAwait(false);
            #endregion

            Assert.AreEqual(group.CourseId, addedGroup.CourseId);
            Assert.AreEqual(group.GroupMates, addedGroup.GroupMates);
            Assert.AreEqual(group.Name, addedGroup.Name);

            await _groupsRepository.DeleteAsync(addedGroupId);
        }

        [Test, Description("Test if group returns with group mates")]
        public async Task GetGroupWithMatesTest()
        {
            #region init data
            var group = new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o" };
            var addedGroupId = await _groupsRepository.AddAsync(group);

            var mates = new List<GroupMate>
            {
                new GroupMate{GroupId = addedGroupId, StudentId = "st1"},
                new GroupMate{GroupId = addedGroupId, StudentId = "st2"},
                new GroupMate{GroupId = addedGroupId, StudentId = "st3"}
            };

            _courseContext.AddRange(mates);
            _courseContext.SaveChanges();
            #endregion

            Group addedGroup = await _service.GetGroupAsync(addedGroupId);
            Assert.AreEqual(group.CourseId, addedGroup.CourseId);
            Assert.AreEqual(group.Name, addedGroup.Name);
            mates.ForEach(mate => 
                Assert.IsNotNull(addedGroup.GroupMates.Find(c => c.StudentId == mate.StudentId)));

            await _groupsRepository.DeleteAsync(addedGroupId);
        }

        [Test]
        public async Task AddGroupTest()
        {
            #region init data
            var group = new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o" };
            var addedGroupId = await _service.AddGroupAsync(group, 1).ConfigureAwait(false);
            #endregion

            var answer = _courseContext.Groups.Find(addedGroupId);
            Assert.IsNotNull(answer);

            await _groupsRepository.DeleteAsync(addedGroupId);
        }

        [Test]
        public async Task AddGroupWithMatesTest()
        {
            #region init data
            var mates = new List<GroupMate>();
            mates.Add(new GroupMate { StudentId = "st1"});
            mates.Add(new GroupMate { StudentId = "st2" });

            var group = new Group { CourseId = 1, GroupMates = mates, Name = "0_o" };
            var addedGroupId = await _service.AddGroupAsync(group, 1).ConfigureAwait(false);
            #endregion

            var answer = _courseContext.Groups.Find(addedGroupId);
            Assert.IsNotNull(answer);

            var studentIds = answer.GroupMates.ToArray().Select(cm => cm.Id).ToList();

            studentIds.ForEach(c => Assert.IsNotNull(_courseContext.GroupMates.Find(c)));

            await _groupsRepository.DeleteAsync(addedGroupId);
        }

        [Test]
        public async Task DeleteGroupTask()
        {
            #region init data
            var mates = new List<GroupMate>();
            mates.Add(new GroupMate { StudentId = "st1" });
            mates.Add(new GroupMate { StudentId = "st2" });

            var group = new Group { CourseId = 1, GroupMates = mates, Name = "0_o" };
            var addedGroupId = await _service.AddGroupAsync(group, 1).ConfigureAwait(false);
            #endregion

            var answer = _courseContext.Groups.Find(addedGroupId);
            var matesIds = _courseContext.GroupMates.ToArray().Select(cm => cm.Id).ToList();
            await _service.DeleteGroupAsync(addedGroupId);

            foreach (var x in _courseContext.Set<Group>().Local.ToList())
            {
                _courseContext.Entry(x).State = EntityState.Detached;
            }
            _courseContext.Set<Group>().Load();

            foreach (var x in _courseContext.Set<GroupMate>().Local.ToList())
            {
                _courseContext.Entry(x).State = EntityState.Detached;
            }
            _courseContext.Set<GroupMate>().Load();

            Assert.IsNull(await _groupsRepository.GetAsync(addedGroupId));
            matesIds.ForEach(async cm => Assert.IsNull(await _groupMatesRepository.GetAsync(cm)));
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