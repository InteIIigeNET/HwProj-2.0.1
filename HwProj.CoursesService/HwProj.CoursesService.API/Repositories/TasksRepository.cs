using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class TasksRepository : CrudRepository<HomeworkTask, long>, ITasksRepository
    {
        public TasksRepository(CourseContext context)
            : base(context)
        {
        }

        public Task<HomeworkTask?> GetWithHomeworkAsync(long id)
        {
            return Context.Set<HomeworkTask>()
                .Include(x => x.Homework)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
