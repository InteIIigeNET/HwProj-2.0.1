using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories.Groups
{
    public class TaskModelsRepository : CrudRepository<TaskModel, long>, ITaskModelsRepository
    {
        public TaskModelsRepository(CourseContext context)
            : base(context)
        {
        }
    }
}
