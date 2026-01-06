using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ITasksRepository : ICrudRepository<HomeworkTask, long>
    {
        Task<HomeworkTask?> GetWithHomeworkAsync(long id);

        Task AddLtiUrlAsync(long taskId, string ltiUrl);
        Task<string?> GetLtiUrlAsync(long taskId);

        Task<Dictionary<long, string>> GetLtiUrlsForTasksAsync(IEnumerable<long> taskIds);
    }
}
