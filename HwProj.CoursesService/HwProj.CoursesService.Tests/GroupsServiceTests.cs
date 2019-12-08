using HwProj.CoursesService.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using NUnit.Framework;
using HwProj.CoursesService.API.Services;
using HwProj.CoursesService.API.Repositories;

namespace HwProj.CoursesService.Tests
{
    [TestFixture]
    public class GroupsServiceTests
    {
        GroupsService service;

        GroupsServiceTests()
        {
            var options = new DbContextOptionsBuilder();
            CourseContext context = new CourseContext(options.Options);

            var groupRepo = new GroupsRepository(context);
            var coursesRepo = new CoursesRepository(context);
            var courseMatesRepo = new CourseMatesRepository(context);
            var groupMatesRepo = new GroupMatesRepository(context);


            var courses = new List<Course>
            {
                new Course{Id = 1, GroupName = "244", IsComplete = false, IsOpen = true,
                    MentorId = "test", CourseMates = new List<CourseMate>(), Name = "course1" },
                new Course{Id = 2, GroupName = "144", IsComplete = false, IsOpen = true,
                    MentorId = "test", CourseMates = new List<CourseMate>(), Name = "course2" },
                new Course{Id = 3, GroupName = "4444", IsComplete = false, IsOpen = true,
                    MentorId = "test", CourseMates = new List<CourseMate>(), Name = "course3" },
            };

            courses.ForEach(c => context.Courses.Add(c));
            context.SaveChanges();

            var students = new List<CourseMate>
            {
                new CourseMate{Id = 1, CourseId = 1, IsAccepted = true, StudentId = "st1"},
                new CourseMate{Id = 2, CourseId = 1, IsAccepted = true, StudentId = "st2"},
                new CourseMate{Id = 3, CourseId = 2, IsAccepted = true, StudentId = "st3"},
                new CourseMate{Id = 4, CourseId = 3, IsAccepted = true, StudentId = "st4"},
            };

            students.ForEach(c => context.CourseMates.Add(c));
            context.SaveChanges();

            var groups = new List<Group>
            {
                new Group{Id = 1, CourseId = 1, GroupMates = new List<GroupMate>(), Name = "0_o"},
                new Group{Id = 2, CourseId = 1, GroupMates = new List<GroupMate>(), Name = "-_-"},
                new Group{Id = 3, CourseId = 1, GroupMates = new List<GroupMate>(), Name = "=_="}
            };

            groups.ForEach(c => context.Groups.Add(c));
            context.SaveChanges();

            var groupMates = new List<GroupMate>
            {
                new GroupMate{Id = 1, GroupId = 1, IsAccepted = true, StudentId = "st1"},
                new GroupMate{Id = 2, GroupId = 1, IsAccepted = true, StudentId = "st2"},
                new GroupMate{Id = 3, GroupId = 1, IsAccepted = true, StudentId = "st44"},
                new GroupMate{Id = 4, GroupId = 2, IsAccepted = true, StudentId = "st2"},
            };

            groupMates.ForEach(c => context.GroupMates.Add(c));
            context.SaveChanges();

            //service = new GroupsService(groupRepo, courseMatesRepo, groupMatesRepo, //google how to make autoMapper//);
        }

        [Test]
        public void GetGroupTest()
        {
            
        }
    }
}
