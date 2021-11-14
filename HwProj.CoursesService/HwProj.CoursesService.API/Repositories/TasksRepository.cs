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

        public async Task ProcessDeadlineAsync(long taskId, Deadline deadline)
        {
            var task = await Context.Set<HomeworkTask>()
                .FirstOrDefaultAsync(t => t.Id == taskId);
            task.MaxRating -= deadline.ToSubtract;
            
            if (task.MaxRating < 0)
                task.MaxRating = 0;
            if (task.CanSendSolution)
                task.CanSendSolution = !deadline.IsStrict;

            await Context.SaveChangesAsync();
        }
    }
}
