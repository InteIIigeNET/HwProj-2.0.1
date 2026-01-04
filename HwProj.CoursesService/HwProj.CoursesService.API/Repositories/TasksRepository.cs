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

        public async Task AddLtiUrlAsync(long taskId, string ltiUrl)
        {
            var ltiRecord = new HomeworkTaskLtiUrl
            {
                TaskId = taskId,
                LtiLaunchUrl = ltiUrl
            };

            await Context.Set<HomeworkTaskLtiUrl>().AddAsync(ltiRecord);
            
            await Context.SaveChangesAsync();
        }

        public async Task<string?> GetLtiUrlAsync(long taskId)
        {
            var record = await Context.Set<HomeworkTaskLtiUrl>().FindAsync(taskId);
            
            return record?.LtiLaunchUrl;
        }
    }
}
