using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public class TasksRepository : CrudRepository<HomeworkTask, long>, ITasksRepository
    {
        public TasksRepository(CourseContext context)
            : base(context)
        {
        }
    }
}
