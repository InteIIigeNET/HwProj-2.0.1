using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ITaskQuestionsRepository : ICrudRepository<TaskQuestion, long>
    {
    }

    public class TaskQuestionsRepository : CrudRepository<TaskQuestion, long>, ITaskQuestionsRepository
    {
        public TaskQuestionsRepository(CourseContext context)
            : base(context)
        {
        }
    }
}
