using HwProj.CourseWorkService.API.Models.UserInfo;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Models
{
    public sealed class CourseWorkContext : DbContext
    {
        public DbSet<CourseWork> CourseWorks { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<Deadline> Deadlines { get; set; }
        public DbSet<WorkFile> WorkFiles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<StudentProfile> StudentProfiles { get; set; }
        public DbSet<LecturerProfile> LecturerProfiles { get; set; }
        public DbSet<ReviewerProfile> ReviewerProfiles { get; set; }
        public DbSet<CuratorProfile> CuratorProfiles { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Direction> Directions { get; set; }

        public CourseWorkContext(DbContextOptions<CourseWorkContext> options)
            : base(options)
        {
            Database.EnsureCreated();
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, RoleType = RoleTypes.Student, RoleName = "Student" },
                new Role { Id = 2, RoleType = RoleTypes.Lecturer, RoleName = "Lecturer" }, 
                new Role { Id = 3, RoleType = RoleTypes.Reviewer, RoleName = "Reviewer" },
                new Role { Id = 4, RoleType = RoleTypes.Curator, RoleName = "Curator" });

            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);
        }
    }
}
