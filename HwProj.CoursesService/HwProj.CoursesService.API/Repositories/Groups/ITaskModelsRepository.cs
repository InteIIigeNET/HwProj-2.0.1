using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories.Groups
{
    public interface ITaskModelsRepository : ICrudRepository<TaskModel, long>
    {
    }
}
