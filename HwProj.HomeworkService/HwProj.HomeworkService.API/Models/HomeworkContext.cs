using Microsoft.EntityFrameworkCore;

namespace HwProj.HomeworkService.API.Models
{
    public sealed class HomeworkContext : DbContext
    {
        public DbSet<Homework> Homeworks { get; set; }
        public DbSet<HomeworkTask> Tasks { get; set; }

        public HomeworkContext(DbContextOptions options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }
}