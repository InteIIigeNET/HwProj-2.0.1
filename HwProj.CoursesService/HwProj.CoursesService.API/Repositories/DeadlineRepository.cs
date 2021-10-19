using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

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
            var deadlines = Context.Set<Deadline>().Where(d => d.TaskId == deadline.TaskId);
            var lastAddedDeadline = await deadlines.OrderByDescending(d => d.Id).FirstOrDefaultAsync();
            
            if (lastAddedDeadline != null && lastAddedDeadline.DateTime > deadline.DateTime)
            {
                var listOfDeadlines = await deadlines.ToListAsync();
                listOfDeadlines.Add(deadline);
                listOfDeadlines.Sort((x, y) => DateTime.Compare(x.DateTime, y.DateTime));

                for (var i = 0; i < listOfDeadlines.Count; ++i)
                {
                    listOfDeadlines[i].CorrectionNumber = i;
                    listOfDeadlines[i].DeadlineType = DeadlineType.Corrections;
                }
                
                listOfDeadlines[0].DeadlineType = DeadlineType.TaskDeadline;
                await Context.SaveChangesAsync().ConfigureAwait(false);
            }
            else if (lastAddedDeadline != null)
            {
                deadline.CorrectionNumber = deadlines.Count();
                deadline.DeadlineType = DeadlineType.Corrections;
            }
            return await AddAsync(deadline);
        }

        public async Task<bool> CheckIfDeadlineExistsAsync(Deadline deadline)
        {
            return await Context.Set<Deadline>()
                .AnyAsync(d => d.TaskId == deadline.TaskId && d.DateTime == deadline.DateTime);
        }
    }
}
