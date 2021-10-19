using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public class DeadlinesRepository : CrudRepository<Deadline, long>, IDeadlinesRepository
    {
        public DeadlinesRepository(CourseContext context)
            : base(context)
        {
        }

        public async Task<long> AddDeadlineAsync(Deadline deadline)
        {
            var deadlinesBefore = FindAll(d => d.TaskId == deadline.TaskId);
            deadline.DeadlineType = deadlinesBefore.Any() ? DeadlineType.Corrections : DeadlineType.TaskDeadline; 
            deadline.CorrectionNumber = deadlinesBefore.Count();
            return await AddAsync(deadline);
        }
    }
}
