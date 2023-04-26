using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Newtonsoft.Json;

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
        public DbSet<Deadline> Deadlines { get; set; }

        public CourseContext(DbContextOptions options)
            : base(options)
        {
            Database.EnsureCreated();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GroupMate>().HasAlternateKey(u => new { u.GroupId, u.StudentId });
            
            modelBuilder.Entity<Deadline>()
                .Property(x => x.AffectedStudentsId)
                .HasConversion(new ValueConverter<List<string>, string>(
                    v => JsonConvert.SerializeObject(v),
                    v => JsonConvert.DeserializeObject<List<string>>(v)));
            
            modelBuilder.Entity<Deadline>()
                .Property(x => x.JobId)
                .HasConversion(new ValueConverter<List<string>, string>(
                    v => JsonConvert.SerializeObject(v),
                    v => JsonConvert.DeserializeObject<List<string>>(v)));
        }
    }
}
