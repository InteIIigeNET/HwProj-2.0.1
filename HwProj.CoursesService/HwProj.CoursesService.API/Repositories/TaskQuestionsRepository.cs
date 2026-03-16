using HwProj.CoursesService.API.Models;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Repositories
{
    public class TaskQuestionsRepository : CrudRepository<TaskQuestion, long>, ITaskQuestionsRepository
    {
        public TaskQuestionsRepository(CourseContext context)
            : base(context)
        {
        }
    }
}