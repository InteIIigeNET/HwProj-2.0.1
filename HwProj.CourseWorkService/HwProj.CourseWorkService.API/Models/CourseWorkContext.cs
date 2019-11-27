using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Models
{
    public class CourseWorkContext : DbContext
    {
        public DbSet<CourseWork> CourseWorks { get; set; }
        public DbSet<Application> Applications { get; set; }

        public CourseWorkContext(DbContextOptions options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }
}
