using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models
{
    public class HomeworksContext : DbContext
    {
        public DbSet<Homework> Homeworks { get; set; }
        public DbSet<HomeworkApplication> Applications { get; set; }
        public DbSet<Course> Courses { get; set; }

        public HomeworksContext(DbContextOptions options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }
}
