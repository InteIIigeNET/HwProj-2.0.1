using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories.Groups
{
    interface ITasksRepository : ICrudRepository<TasksModel>
    {
    }
}
