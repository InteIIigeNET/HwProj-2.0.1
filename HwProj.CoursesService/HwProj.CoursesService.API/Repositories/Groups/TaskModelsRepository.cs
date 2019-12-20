using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories.Groups
{
    public class TaskModelsRepository : CrudRepository<TaskModel>, ITaskModelsRepository
    {
        public TaskModelsRepository(CourseContext context)
            : base(context)
        {
        }
    }
}
