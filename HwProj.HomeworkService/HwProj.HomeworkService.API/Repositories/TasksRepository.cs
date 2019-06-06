using HwProj.HomeworkService.API.Models;
using HwProj.Repositories;

namespace HwProj.HomeworkService.API.Repositories
{
    public class TasksRepository : CrudRepository<HomeworkTask>, ITasksRepository
    {
        public TasksRepository(HomeworkContext context)
            : base(context)
        {
        }
    }
}