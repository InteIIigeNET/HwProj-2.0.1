using HwProj.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.TasksService.API.Models.Repositories
{
    public interface ITaskRepository : ICrudRepository<HomeworkTask>
    {
    }
}
