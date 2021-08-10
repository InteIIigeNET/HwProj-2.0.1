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
using HwProj.CoursesService.API.Repositories.Groups;
using FluentAssertions;

namespace HwProj.CoursesService.Tests
{
    /*
    [TestFixture]
    public class GroupsServiceTests
    {
        private CourseContext _courseContext;
        private GroupsRepository _groupsRepository;
        private GroupMatesRepository _groupMatesRepository;
        private GroupsService _service;
        private IMapper _mapper;

        [SetUp]
        public void Setup()
        {
            var connectionString = "Server=(localdb)\\mssqllocaldb;Database=GroupsServiceDB;Trusted_Connection=True;";
            var builder = new DbContextOptionsBuilder();
            var options = builder.UseSqlServer(connectionString).Options;
            _courseContext = new CourseContext(options);
            _groupsRepository = new GroupsRepository(_courseContext);
            _groupMatesRepository = new GroupMatesRepository(_courseContext);
            var _taskModelsRepository = new TaskModelsRepository(_courseContext);

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<ApplicationProfile>();
            });
            _mapper = config.CreateMapper();

            _service = new GroupsService(_groupsRepository, _groupMatesRepository, _taskModelsRepository, _mapper);
        }

        [Test]
        public async Task GetGroupTest()
        {
            using (var transaction = _courseContext.Database.BeginTransaction())
            {
                #region init data
                var group = new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o" };
                var addedGroupId = await _groupsRepository.AddAsync(group);
                var addedGroup = await _service.GetGroupAsync(addedGroupId).ConfigureAwait(false);
                #endregion

                addedGroup.Should().BeEquivalentTo(group);
            }
        }

        [Test, Description("Test if group returns with group mates")]
        public async Task GetGroupWithMatesTest()
        {
            using (var transaction = _courseContext.Database.BeginTransaction())
            {
                #region init data
                var mates = new List<GroupMate>
                {
                    new GroupMate{ StudentId = "st1" },
                    new GroupMate{ StudentId = "st2" },
                    new GroupMate{ StudentId = "st3" }
                };
                var group = new Group { CourseId = 1, GroupMates = mates, Name = "0_o" };
                var addedGroupId = await _groupsRepository.AddAsync(group);
                #endregion

                Group addedGroup = await _service.GetGroupAsync(addedGroupId);
                addedGroup.Should().BeEquivalentTo(group);
            }
        }

        [Test]
        public async Task AddGroupTest()
        {
            using (var transaction = _courseContext.Database.BeginTransaction())
            {
                #region init data
                var group = new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o" };
                var addedGroupId = await _service.AddGroupAsync(group).ConfigureAwait(false);
                #endregion

                var addedGroup = await _groupsRepository.GetAsync(addedGroupId);
                addedGroup.Should().BeEquivalentTo(group);
            }
        }

        [Test]
        public async Task AddGroupWithMatesAndTasksTest()
        {
            using (var transaction = _courseContext.Database.BeginTransaction())
            {
                #region init data
                var mates = new List<GroupMate>
                {
                    new GroupMate { StudentId = "st1" },
                    new GroupMate { StudentId = "st2" }
                };

                var tasks = new List<TaskModel>
                {
                    new TaskModel { TaskId = 1 },
                    new TaskModel { TaskId = 2 }
                };

                var group = new Group { CourseId = 1, GroupMates = mates, Name = "0_o", Tasks = tasks };
                var addedGroupId = await _service.AddGroupAsync(group).ConfigureAwait(false);
                #endregion

                var addedGroup = await _groupsRepository.GetAsync(addedGroupId);

                addedGroup.Should().BeEquivalentTo(group);
            }
        }

        [Test]
        public async Task DeleteGroupTest()
        {
            using (var transaction = _courseContext.Database.BeginTransaction())
            {
                #region init data
                var mates = new List<GroupMate>
                {
                new GroupMate { StudentId = "st1" },
                new GroupMate { StudentId = "st2" }
                };

                var group = new Group { CourseId = 1, GroupMates = mates, Name = "0_o" };
                var addedGroupId = await _service.AddGroupAsync(group);
                #endregion

                var matesIds = _groupMatesRepository.FindAll(cm => cm.GroupId == addedGroupId).ToList();
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

                foreach (var x in _courseContext.Set<TaskModel>().Local.ToList())
                {
                    _courseContext.Entry(x).State = EntityState.Detached;
                }
                _courseContext.Set<TaskModel>().Load();
                //end

                var addedGroup = await _groupsRepository.GetAsync(addedGroupId).ConfigureAwait(false);
                addedGroup.Should().Be(null);
                matesIds.ForEach(async cm => (await _groupMatesRepository.GetAsync(cm.Id)).Should().Be(null));
            }
        }

        [Test]
        public async Task AddGroupMateTest()
        {
            using (var transaction = _courseContext.Database.BeginTransaction())
            {
                #region init data
                var group = new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o" };
                var addedGroupId = await _groupsRepository.AddAsync(group);
                #endregion

                var mate = new GroupMate { StudentId = "st"};
                await _service.AddGroupMateAsync(addedGroupId, mate.StudentId);

                var addedGroup = await _service.GetGroupAsync(addedGroupId).ConfigureAwait(false);
                addedGroup.GroupMates.Select(cm => cm.StudentId).Should().ContainEquivalentOf(mate.StudentId);
            }
        }

        [Test]
        public async Task AddSameGroupMateTest()
        {
            using (var transaction = _courseContext.Database.BeginTransaction())
            {
                #region init data
                var group = new Group { CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o" };
                var addedGroupId = await _groupsRepository.AddAsync(group);
                #endregion

                await _service.AddGroupMateAsync(addedGroupId, "st");
                Assert.ThrowsAsync<System.InvalidOperationException>(async () => await _service.AddGroupMateAsync(addedGroupId, "st"));
            }
        }

        [Test]
        public async Task DeleteGroupMateTest()
        {
            using (var transaction = _courseContext.Database.BeginTransaction())
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
                addedGroup.GroupMates.Should().BeEmpty();
            }
        }

        [Test]
        public async Task GetAllGroupsInCourseTest()
        {
            using (var transaction = _courseContext.Database.BeginTransaction())
            {
                #region init data
                var gr1 = new Group { CourseId = 1, Name = "gr1", 
                    GroupMates = new List<GroupMate> { new GroupMate { StudentId = "st1" }, new GroupMate { StudentId = "st2" } } };
                var gr2 = new Group { CourseId = 1, Name = "gr2", GroupMates = new List<GroupMate> { new GroupMate { StudentId = "st3" } } };
                var gr3 = new Group { CourseId = 2, Name = "gr3", GroupMates = new List<GroupMate> { new GroupMate { StudentId = "st42" } } };
                await _groupsRepository.AddAsync(gr1);
                await _groupsRepository.AddAsync(gr2);
                await _groupsRepository.AddAsync(gr3);
                #endregion

                var course1Groups = await _service.GetAllAsync(1).ConfigureAwait(false);
                var course2Groups = await _service.GetAllAsync(2).ConfigureAwait(false);

                course1Groups.Should().ContainEquivalentOf(gr1);
                course1Groups.Should().ContainEquivalentOf(gr2);
                course2Groups.Should().ContainEquivalentOf(gr3);
            }
        }

        [Test]
        public async Task UpdateGroupTest()
        {
            using (var transaction = _courseContext.Database.BeginTransaction())
            {
                var group = new Group
                {
                    CourseId = 1,
                    Name = "gr1",
                    GroupMates = new List<GroupMate> { new GroupMate { StudentId = "st1" }, new GroupMate { StudentId = "st2" } },
                    Tasks = new List<TaskModel> { new TaskModel { TaskId = 1 } }
                };

                var id = await _service.AddGroupAsync(group);

                var updated = new Group
                {
                    CourseId = 1,
                    Name = "gr2",
                    GroupMates = new List<GroupMate> { },
                    Tasks = new List<TaskModel> { new TaskModel { TaskId = 2 } }
                };

                await _service.UpdateAsync(id, updated);

                var addedGroup = await _groupsRepository.GetAsync(id);

                updated.Id = id;
                addedGroup.Should().BeEquivalentTo(updated);
            }
        }

        [Test]
        public async Task GetStudentsGroupTest()
        {
            using (var transaction = _courseContext.Database.BeginTransaction())
            {
                #region init data
                var gr1 = new Group { CourseId = 1, Name = "gr1" };
                var gr2 = new Group { CourseId = 1, Name = "gr2" };
                var gr3 = new Group { CourseId = 2, Name = "gr3" };
                var addedGroup1Id = await _groupsRepository.AddAsync(gr1);
                var addedGroup2Id = await _groupsRepository.AddAsync(gr2);
                var addedGroup3Id = await _groupsRepository.AddAsync(gr3);
                await _service.AddGroupMateAsync(addedGroup1Id, "st");
                await _service.AddGroupMateAsync(addedGroup2Id, "st");
                await _service.AddGroupMateAsync(addedGroup3Id, "st");
                #endregion

                var groups1 = await _service.GetStudentGroupsAsync(1, "st");
                var groups2 = await _service.GetStudentGroupsAsync(2, "st");
                groups1.Should().ContainEquivalentOf(_mapper.Map<UserGroupDescription>(gr1));
                groups1.Should().ContainEquivalentOf(_mapper.Map<UserGroupDescription>(gr2));
                groups2.Should().ContainEquivalentOf(_mapper.Map<UserGroupDescription>(gr3));
            }
        }

        [Test]
        public void MapperTest()
        {
            var groupViewModel = new CreateGroupViewModel
            {   
                CourseId = 1,
                GroupMates = new List<GroupMateViewModel>
                {
                    new GroupMateViewModel {StudentId = "st1" }
                },
                Tasks = new List<long>
                { 
                    42
                }
            };

            var group = _mapper.Map<Group>(groupViewModel);

            Assert.IsNotEmpty(group.GroupMates.Where(cm => cm.StudentId == "st1"));
            Assert.IsNotEmpty(group.Tasks.Where(cm => cm.TaskId == 42));
        }
    }
    */
}