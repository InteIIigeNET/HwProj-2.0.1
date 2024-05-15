using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Models
{
    public sealed class CourseContext : DbContext
    {
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseMate> CourseMates { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMate> GroupMates { get; set; }
        public DbSet<TaskModel> TasksModels { get; set; }
        public DbSet<Homework> Homeworks { get; set; }
        public DbSet<HomeworkTask> Tasks { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<CourseFilter> CourseFilters { get; set; }
        public DbSet<UserToCourseFilter> UserToCourseFilters { get; set; }

        public CourseContext(DbContextOptions options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GroupMate>().HasAlternateKey(u => new { u.GroupId, u.StudentId });
            modelBuilder.Entity<Assignment>().HasIndex(a => a.CourseId);
            modelBuilder.Entity<UserToCourseFilter>().HasKey(u => new { u.CourseId, u.UserId });
        }
    }
}
