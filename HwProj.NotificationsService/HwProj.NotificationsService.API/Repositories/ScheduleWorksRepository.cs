using System.Linq;
using System.Threading.Tasks;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace HwProj.NotificationsService.API.Repositories
{
    public class ScheduleWorksRepository : IScheduleWorksRepository
    {
        private readonly DbContext _context;

        public ScheduleWorksRepository(NotificationsContext context)
        {
            _context = context;
        }

        public async Task AddAsync(ScheduleWork work)
        {
            await _context.AddAsync(work).ConfigureAwait(false);
            await _context.SaveChangesAsync().ConfigureAwait(false);
        }

        public async Task DeleteAsync((long? taskId, long? homeworkId, long? courseId, string categoryId) id)
        {
            await _context.Set<ScheduleWork>()
                .Where(work => work.TaskId.Equals(id.taskId) &&
                               work.HomeworkId.Equals(id.homeworkId) &&
                               work.CourseId.Equals(id.courseId) &&
                               work.CategoryId.Equals(id.categoryId))
                .DeleteAsync()
                .ConfigureAwait(false);
        }
    }
}
