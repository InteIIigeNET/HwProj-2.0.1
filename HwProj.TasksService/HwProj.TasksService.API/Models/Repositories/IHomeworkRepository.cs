using HwProj.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.TasksService.API.Models.Repositories
{
    public interface IHomeworkRepository : ICrudRepository<Homework>
    {
        Task AddTask(long homeworkId, HomeworkTask task);
    }
}
