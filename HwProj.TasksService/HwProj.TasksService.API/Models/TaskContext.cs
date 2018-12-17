using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.TasksService.API.Models
{
    public class TaskContext : DbContext
    {
        public DbSet<Task> Tasks { get; set; }
        public DbSet<Homework> Homeworks { get; set; }
    }
}
