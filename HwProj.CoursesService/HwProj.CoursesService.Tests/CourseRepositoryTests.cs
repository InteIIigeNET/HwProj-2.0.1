using HwProj.CoursesService.API.Models;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Linq;
using System.Threading.Tasks;
using Shouldly;

namespace Tests
{
    [TestFixture]
    public class CourseRepositoryTests
    {
        private CourseContext _context;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<CourseContext>()
                .UseInMemoryDatabase(databaseName: "repository_test")
                .Options;

            _context = new CourseContext(options);
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();
        }

        [Test]
        public async Task AddWritesToDatabase()
        {
            var repository = new CourseRepository(_context);
            var course = new Course()
            {
                Id = 1,
                Name = "course_name"
            };

            await repository.AddAsync(course);
            var addedCourse = await _context.Courses.SingleAsync();

            addedCourse.ShouldBe(course);
        }

        [Test]
        public void AddWritesSeveralCourses()
        {
            var repository = new CourseRepository(_context);
            var courses = Enumerable.Range(1, 10)
                .Select(i => new Course() { Id = i, Name = $"course{i}" })
                .ToList();

            courses.ForEach(async course => await repository.AddAsync(course));
            var addedCourses = _context.Courses.ToList();

            addedCourses.Count.ShouldBe(courses.Count);
            addedCourses.ShouldBe(courses);
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

            {
                var repository = new CourseRepository(_context);
                await repository.AddAsync(course);
            }

            {
                var repository = new CourseRepository(_context);
                var gottenCourse = await repository.GetAsync(course.Id);

                gottenCourse.ShouldBe(course);
            }
        }
    }
}