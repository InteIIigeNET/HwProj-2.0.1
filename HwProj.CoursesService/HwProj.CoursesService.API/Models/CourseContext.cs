using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Models
{
    public sealed class CourseContext : DbContext
    {
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseMate> CourseMates { get; set; }

        public CourseContext(DbContextOptions options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }
}
