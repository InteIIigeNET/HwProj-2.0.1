using Microsoft.EntityFrameworkCore;

namespace SecondTestUserService.Models
{
    public class CopyUsersContext : DbContext
    {
        public DbSet<CopyUser> CopyUsers { get; set; }
        public CopyUsersContext(DbContextOptions<CopyUsersContext> options)
            : base(options)
        { }
    }
}
