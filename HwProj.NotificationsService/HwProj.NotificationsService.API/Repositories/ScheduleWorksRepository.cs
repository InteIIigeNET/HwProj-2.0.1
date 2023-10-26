using System.Linq;
using System.Threading.Tasks;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.NotificationsService.API.Repositories
{
    public class ScheduleWorksRepository : CrudRepository<ScheduleWork, string>, IScheduleWorksRepository
    {
        public ScheduleWorksRepository(NotificationsContext context) : base(context)
        {
        }
        
        public bool Contains(string id)
        {
            return Context.Set<ScheduleWork>().AsNoTracking().Any(work => work.Id.Equals(id));
        }
    }
}