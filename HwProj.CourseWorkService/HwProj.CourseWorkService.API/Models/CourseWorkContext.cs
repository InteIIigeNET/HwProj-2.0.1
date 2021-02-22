using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Models
{
    public sealed class CourseWorkContext : IdentityDbContext<User>
    {
        public DbSet<CourseWork> CourseWorks { get; set; }
        public DbSet<Application> Applications { get; set; }
        //public DbSet<WorkFile> WorkFiles { get; set; }
        public DbSet<Deadline> Deadlines { get; set; }
        //public DbSet<Bid> Bids { get; set; }

        public CourseWorkContext(DbContextOptions options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }
}
