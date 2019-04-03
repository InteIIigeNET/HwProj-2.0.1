using Microsoft.EntityFrameworkCore;

namespace HwProj.SolutionsService.API.Models
{
    public class SolutionContext : DbContext
    {
        public DbSet<Solution> Solutions { get; set; }

        public SolutionContext(DbContextOptions options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }
}