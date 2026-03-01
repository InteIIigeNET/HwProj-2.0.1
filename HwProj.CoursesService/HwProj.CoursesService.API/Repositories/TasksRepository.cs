using System.Collections.Generic;
using System.Linq;
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

        public async Task AddLtiUrlAsync(long taskId, LtiLaunchData ltiLaunchData)
        {
            var existingRecord = await Context.Set<HomeworkTaskLtiUrl>().FindAsync(taskId);

            if (existingRecord != null)
            {
                existingRecord.LtiLaunchUrl = ltiLaunchData.LtiLaunchUrl;
                existingRecord.CustomParams = ltiLaunchData.CustomParams;
                Context.Set<HomeworkTaskLtiUrl>().Update(existingRecord);
            }
            else
            {
                var ltiRecord = new HomeworkTaskLtiUrl
                {
                    TaskId = taskId,
                    LtiLaunchUrl = ltiLaunchData.LtiLaunchUrl,
                    CustomParams = ltiLaunchData.CustomParams
                };
                await Context.Set<HomeworkTaskLtiUrl>().AddAsync(ltiRecord);
            }
    
            await Context.SaveChangesAsync();
        }

        public async Task<LtiLaunchData?> GetLtiDataAsync(long taskId)
        {
            var record = await Context.Set<HomeworkTaskLtiUrl>().FindAsync(taskId);
            
            return record == null ? null : new LtiLaunchData 
            {
                LtiLaunchUrl = record.LtiLaunchUrl,
                CustomParams = record.CustomParams
            };
        }

        public async Task<Dictionary<long, LtiLaunchData>> GetLtiDataForTasksAsync(IEnumerable<long> taskIds)
        {
            return await Context.Set<HomeworkTaskLtiUrl>()
                .Where(t => taskIds.Contains(t.TaskId))
                .ToDictionaryAsync(t => t.TaskId, t => new LtiLaunchData
                {
                    LtiLaunchUrl = t.LtiLaunchUrl,
                    CustomParams = t.CustomParams
                });
        }
    }
}
