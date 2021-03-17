using HwProj.HomeworkService.API.Models;
using HwProj.Repositories;

namespace HwProj.HomeworkService.API.Repositories
{
    public interface ITasksRepository : ICrudRepository<HomeworkTask, long>
    {
    }
}