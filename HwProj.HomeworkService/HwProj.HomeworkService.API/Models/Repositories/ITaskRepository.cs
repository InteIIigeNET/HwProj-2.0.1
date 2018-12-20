using HwProj.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models.Repositories
{
    public interface ITaskRepository : ICrudRepository<HomeworkTask>
    {
    }
}
