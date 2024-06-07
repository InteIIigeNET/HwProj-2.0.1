using HwProj.Models.SolutionsService;
using Microsoft.EntityFrameworkCore;

namespace HwProj.SolutionsService.API.Models
{
    public sealed class SolutionContext : DbContext
    {
        public DbSet<Solution> Solutions { get; set; }
        
        public DbSet<GithubSolutionCommit> LastGithubSolutionCommits { get; set; }

        public SolutionContext(DbContextOptions options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Solution>().HasIndex(n => n.TaskId);
        }
    }
}
