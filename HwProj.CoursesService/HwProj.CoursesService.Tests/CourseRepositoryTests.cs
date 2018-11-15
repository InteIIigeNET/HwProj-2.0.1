using HwProj.CoursesService.API.Models;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Linq;
using System.Threading.Tasks;
using Shouldly;
using Microsoft.Data.Sqlite;
using System.Collections.Generic;

namespace Tests
{
    [TestFixture]
    public class CourseRepositoryTests
    {
        private SqliteConnection _connection;
        private DbContextOptions<CourseContext> _options;

        private Course course1;
        private Course course2;
        private List<Course> courses;

        [SetUp]
        public void Setup()
        {
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            _options = new DbContextOptionsBuilder<CourseContext>()
                .UseSqlite(_connection)
                .Options;

            using (var context = new CourseContext(_options))
            {
                context.Database.EnsureCreated();
            }

            course1 = new Course() { Id = 1, Name = "course_name1", GroupName = "144", IsOpen = true };
            course2 = new Course() { Id = 2, Name = "course_name2", GroupName = "243" };
            courses = Enumerable.Range(1, 10)
                .Select(i => new Course() { Id = i, Name = $"course{i}" })
                .ToList();
        }

        [TearDown]
        public void Teardown()
        {
            using (var context = new CourseContext(_options))
            {
                context.Database.EnsureDeleted();
            }
            _connection.Close();
        }

        [Test]
        public async Task AddWritesToDatabase()
        {
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course1);
            }

            using (var context = new CourseContext(_options))
            {
                var addedCourse = await context.Courses.SingleAsync();
                addedCourse.ShouldBe(course1);
            }
        }

        [Test]
        public void AddWritesSeveralCourses()
        {
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                courses.ForEach(async course => await repository.AddAsync(course));
            }

            using (var context = new CourseContext(_options))
            {
                var addedCourses = context.Courses.ToList();
                addedCourses.Count.ShouldBe(courses.Count);
                addedCourses.ShouldBe(courses);
            }
        }

        [Test]
        public async Task GetAsyncGetsRightCourse()
        {
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course1);
            }

            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                var gottenCourse = await repository.GetAsync(course1.Id);

                gottenCourse.ShouldBe(course1);
            }
        }

        [Test]
        public async Task GetAsyncGetsNullOnInvalidId()
        {
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course1);
            }

            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                repository.GetAsync(5).Result.ShouldBeNull();
            }
        }

        [Test]
        public void CoursesGetsAllCourses()
        {
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                courses.ForEach(async course => await repository.AddAsync(course));
            }

            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);

                var gottenCourses = repository.Courses;
                gottenCourses.ShouldBe(courses);
            }
        }

        [Test]
        public async Task DeleteByIdDeletesFromDatabase()
        {
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course1);
            }

            var deleted = false;
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                deleted = await repository.DeleteByIdAsync(course1.Id);
            }

            using (var context = new CourseContext(_options))
            {
                context.Courses.Count().ShouldBe(0);
                deleted.ShouldBeTrue();
            }
        }

        [Test]
        public async Task DeleteByIdDeletesRightCourse()
        {
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course1);
                await repository.AddAsync(course2);
            }

            var deleted = false;
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                deleted = await repository.DeleteByIdAsync(course2.Id);
            }

            using (var context = new CourseContext(_options))
            {
                context.Courses.Count().ShouldBe(1);
                context.Courses.ShouldContain(course1);
                deleted.ShouldBeTrue();
            }
        }

        [Test]
        public async Task DeleteByIdDontChangeDatabaseOnInvalidId()
        {
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course1);
                await repository.AddAsync(course2);
            }

            var deleted = true;
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                deleted = await repository.DeleteByIdAsync(1001);
            }

            using (var context = new CourseContext(_options))
            {
                context.Courses.Count().ShouldBe(2);
                context.Courses.ShouldContain(course1);
                context.Courses.ShouldContain(course2);
                deleted.ShouldBeFalse();
            }
        }

        [Test]
        public async Task UpdateWritesToDatabase()
        {
            var course = new Course() { Id = 100, Name = "java", GroupName = "144" };
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course);
            }

            var courseViewModel = new CourseViewModel() { Name = "c#", GroupName = "244", IsOpen = true };
            var updated = false;
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                updated = await repository.UpdateAsync(course.Id, courseViewModel);
            }

            using (var context = new CourseContext(_options))
            {
                course.Name = courseViewModel.Name;
                course.GroupName = courseViewModel.GroupName;
                course.IsOpen = courseViewModel.IsOpen;

                var updatedCourse = context.Courses.Find(course.Id);
                updatedCourse.ShouldBe(course);
                updated.ShouldBeTrue();
            }
        }

        [Test]
        public async Task UpdateModifiesRightCourse()
        {
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course1);
                await repository.AddAsync(course2);
            }

            var courseViewModel = new CourseViewModel() { Name = "java", GroupName = "144", IsOpen = true };
            var updated = false;
            using (var context = new CourseContext(_options))
            {
                var reposository = new CourseRepository(context);
                updated = await reposository.UpdateAsync(course1.Id, courseViewModel);
            }

            using (var context = new CourseContext(_options))
            {
                course1.Name = courseViewModel.Name;
                var updatedCourse = context.Courses.Find(course1.Id);

                updatedCourse.ShouldBe(course1);
                context.Courses.ShouldContain(course2);
                context.Courses.Count().ShouldBe(2);
                updated.ShouldBeTrue();
            }
        }

        [Test]
        public async Task UpdateDontChangeDatabaseOnInvalidId()
        {
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course1);
            }

            var courseViewModel = new CourseViewModel() { Name = "c#", GroupName = "244", IsOpen = true };
            var updated = true;
            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                updated = await repository.UpdateAsync(800, courseViewModel);
            }

            using (var context = new CourseContext(_options))
            {
                context.Courses.ShouldContain(course1);
                context.Courses.Count().ShouldBe(1);
                updated.ShouldBeFalse();
            }
        }
    }
}