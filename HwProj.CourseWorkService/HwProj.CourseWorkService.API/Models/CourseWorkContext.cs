using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Models
{
    public class CourseWorkContext : DbContext
    {
        public DbSet<CourseWork> CourseWorks { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<WorkFile> WorkFiles { get; set; }
        public DbSet<Deadline> Deadlines { get; set; }
        public DbSet<User> Users { get; set; }

        public CourseWorkContext(DbContextOptions options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }
}
