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
//Flue


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

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<ApplicationProfile>();
            });
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
        }

        [Test]
        public async Task AddGroupWithMatesTest()
        {
            #region init data
            var mates = new List<GroupMate>
            {
                new GroupMate { StudentId = "st1" },
                new GroupMate { StudentId = "st2" }
            };

            var group = new Group { CourseId = 1, GroupMates = mates, Name = "0_o" };
            var addedGroupId = await _service.AddGroupAsync(group, 1).ConfigureAwait(false);
            #endregion

            var answer = _courseContext.Groups.Find(addedGroupId);
            Assert.IsNotNull(answer);

            var studentIds = answer.GroupMates.ToArray().Select(cm => cm.Id).ToList();

            studentIds.ForEach(c => Assert.IsNotNull(_courseContext.GroupMates.Find(c)));
        }

        [Test]
        public async Task DeleteGroupTest()
        {
            #region init data
            var mates = new List<GroupMate>
            {
                new GroupMate { StudentId = "st1" },
                new GroupMate { StudentId = "st2" }
            };

            var group = new Group { CourseId = 1, GroupMates = mates, Name = "0_o" };
            var addedGroupId = await _service.AddGroupAsync(group, 1).ConfigureAwait(false);
            #endregion

            var matesIds = _courseContext.GroupMates.ToArray().Select(cm => cm.Id).ToList();
            await _service.DeleteGroupAsync(addedGroupId);

            //Local part of Database is not updated automaticly, so...
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
            //end

            Assert.IsNull(await _groupsRepository.GetAsync(addedGroupId));
            matesIds.ForEach(async cm => Assert.IsNull(await _groupMatesRepository.GetAsync(cm)));
        }

        [Test]
        public async Task AddGroupMateTest()
        {
            #region init data
            var group = new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o" };
            var addedGroupId = await _groupsRepository.AddAsync(group);
            #endregion

            await _service.AddGroupMateAsync(addedGroupId, "st");

            var addedGroup = await _service.GetGroupAsync(addedGroupId).ConfigureAwait(false);
            Assert.IsNotNull(addedGroup.GroupMates.Select(cm => cm.StudentId == "st"));
        }

        [Test]
        public async Task DeleteGroupMateTest()
        {
            #region init data
            var group = new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o" };
            var addedGroupId = await _groupsRepository.AddAsync(group);
            await _service.AddGroupMateAsync(addedGroupId, "st");
            #endregion

            await _service.DeleteGroupMateAsync(addedGroupId, "st");
            foreach (var x in _courseContext.Set<GroupMate>().Local.ToList())
            {
                _courseContext.Entry(x).State = EntityState.Detached;
            }
            _courseContext.Set<GroupMate>().Load();

            var addedGroup = await _service.GetGroupAsync(addedGroupId).ConfigureAwait(false);
            Assert.IsEmpty(addedGroup.GroupMates.Select(cm => cm.StudentId == "st"));
        }

        [Test]
        public async Task GetAllGroupsInCourseTest()
        {
            #region init data
            var addedGroup1Id = await _groupsRepository.AddAsync(new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "gr1" });
            var addedGroup2Id = await _groupsRepository.AddAsync(new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "gr2" });
            var addedGroup3Id = await _groupsRepository.AddAsync(new Group { CourseId = 2, GroupMates = new List<GroupMate>(), Name = "gr3" });
            await _service.AddGroupMateAsync(addedGroup1Id, "st1");
            await _service.AddGroupMateAsync(addedGroup1Id, "st2");
            await _service.AddGroupMateAsync(addedGroup2Id, "st3");
            await _service.AddGroupMateAsync(addedGroup3Id, "st42");
            #endregion

            var addedGroup1 = await _service.GetGroupAsync(addedGroup1Id).ConfigureAwait(false);
            var addedGroup2 = await _service.GetGroupAsync(addedGroup2Id).ConfigureAwait(false);
            var addedGroup3 = await _service.GetGroupAsync(addedGroup3Id).ConfigureAwait(false);

            var course1Groups = await _service.GetAllAsync(1).ConfigureAwait(false);
            var course2Groups = await _service.GetAllAsync(2).ConfigureAwait(false);

            var group1Returned = course1Groups.Where(c => c.Name == "gr1").ToArray().First();
            var group2Returned = course1Groups.Where(c => c.Name == "gr2").ToArray().First();

            Assert.AreEqual(addedGroup1.CourseId, group1Returned.CourseId);
            Assert.IsNotEmpty(group1Returned.GroupMates.Select(c => c.StudentId == "st1"));
            Assert.IsNotEmpty(group1Returned.GroupMates.Select(c => c.StudentId == "st2"));
            Assert.AreEqual(addedGroup1.Name, group1Returned.Name);
            Assert.AreEqual(addedGroup2.CourseId, group2Returned.CourseId);
            Assert.IsNotEmpty(group1Returned.GroupMates.Select(c => c.StudentId == "st3"));
            Assert.AreEqual(addedGroup2.Name, group2Returned.Name);
            Assert.IsTrue(!course1Groups.Contains(addedGroup3));
            Assert.IsNotEmpty(course2Groups.First().GroupMates.Where(cm => cm.StudentId == "st42"));
        }

        [Test]
        public async Task UpdateGroupTest()
        {
            #region init data
            var addedGroupId = await _groupsRepository.AddAsync(new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o" });
            #endregion

            await _service.UpdateAsync(addedGroupId, new Group { Name = "updated"});
            var addedGroup = await _service.GetGroupAsync(addedGroupId).ConfigureAwait(false);
            Assert.AreEqual("updated", addedGroup.Name);
        }

        [Test]
        public async Task GetStudentsGroupTest()
        {
            #region init data
            var addedGroup1Id = await _groupsRepository.AddAsync(new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "gr1" });
            var addedGroup2Id = await _groupsRepository.AddAsync(new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "gr2" });
            var addedGroup3Id = await _groupsRepository.AddAsync(new Group { CourseId = 2, GroupMates = new List<GroupMate>(), Name = "gr3" });
            await _service.AddGroupMateAsync(addedGroup1Id, "st");
            await _service.AddGroupMateAsync(addedGroup2Id, "st");
            await _service.AddGroupMateAsync(addedGroup3Id, "st");
            #endregion

            var groups1 = await _service.GetStudentsGroupsAsync(1, "st");
            var groups2 = await _service.GetStudentsGroupsAsync(2, "st");
            Assert.AreEqual("gr3", groups2.First().Name);
            Assert.IsNotEmpty(groups1.Where(cm => cm.Name == "gr1"));
            Assert.IsNotEmpty(groups1.Where(cm => cm.Name == "gr2"));
        }

        [TearDown]
        public void CleanUp()
        {
            foreach (var entity in _courseContext.GroupMates)
            {
                _courseContext.GroupMates.Remove(entity);
            }
            foreach (var entity in _courseContext.Groups)
            {
                _courseContext.Groups.Remove(entity);
            }
            _courseContext.SaveChanges();
            _courseContext.Dispose();
        }
    }
}