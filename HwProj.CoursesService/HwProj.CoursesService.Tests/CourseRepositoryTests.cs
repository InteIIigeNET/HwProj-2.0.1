using HwProj.CoursesService.API.Models;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Linq;
using System.Threading.Tasks;
using Shouldly;
using Microsoft.Data.Sqlite;

namespace Tests
{
    [TestFixture]
    public class CourseRepositoryTests
    {
        private SqliteConnection _connection;
        private DbContextOptions<CourseContext> _options;

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
            var course = new Course()
            {
                Id = 1,
                Name = "course_name"
            };

            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course);
            }

            using (var context = new CourseContext(_options))
            {
                var addedCourse = await context.Courses.SingleAsync();
                addedCourse.ShouldBe(course);
            }
        }

        [Test]
        public void AddWritesSeveralCourses()
        {
            var courses = Enumerable.Range(1, 10)
                .Select(i => new Course() { Id = i, Name = $"course{i}" })
                .ToList();

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
            var course = new Course()
            {
                Id = 1,
                Name = "course_name",
                GroupName = "123"
            };

            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course);
            }

            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                var gottenCourse = await repository.GetAsync(course.Id);

                gottenCourse.ShouldBe(course);
            }
        }

        [Test]
        public void CoursesGetsAllCourses()
        {
            var courses = Enumerable.Range(1, 10)
                .Select(i => new Course() { Id = i, Name = $"course{i}" })
                .ToList();

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
            var course = new Course()
            {
                Id = 1,
                Name = "course_name"
            };

            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.AddAsync(course);
            }

            using (var context = new CourseContext(_options))
            {
                var repository = new CourseRepository(context);
                await repository.DeleteByIdAsync(course.Id);

                context.Courses.Count().ShouldBe(0);
            }
        }
    }
}