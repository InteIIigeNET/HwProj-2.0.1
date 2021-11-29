using HwProj.Models.SolutionsService;
using Microsoft.EntityFrameworkCore;

namespace HwProj.SolutionsService.API.Models
{
    public sealed class SolutionContext : DbContext
    {
        public SolutionContext(DbContextOptions options)
            : base(options)
        {
            Database.EnsureCreated();
        }

        public DbSet<Solution> Solutions { get; set; }
    }
}
