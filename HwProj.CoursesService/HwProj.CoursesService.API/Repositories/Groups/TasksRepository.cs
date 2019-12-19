using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories.Groups
{
    public class TasksRepository : CrudRepository<TasksModel>, ITasksRepository
    {
        public TasksRepository(CourseContext context)
            : base(context)
        {
        }
    }
}
