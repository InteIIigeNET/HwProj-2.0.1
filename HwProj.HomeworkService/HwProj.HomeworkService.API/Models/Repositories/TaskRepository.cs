using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.HomeworkService.API.Models.Repositories
{
    public class TaskRepository : CrudRepository<HomeworkTask>, ITaskRepository
    {
        public TaskRepository(HomeworkContext context)
            : base(context)
        {
        }
    }
}