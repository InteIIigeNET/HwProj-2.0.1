using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;
using HwProj.Repositories;

namespace HwProj.NotificationsService.API.Repositories
{
    public class ScheduleWorksRepository : CrudRepository<ScheduleWork, long>, IScheduleWorksRepository
    {
        public ScheduleWorksRepository(NotificationsContext context) : base(context)
        {
        }
    }
}