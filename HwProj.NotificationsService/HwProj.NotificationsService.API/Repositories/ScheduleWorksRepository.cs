using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;
using HwProj.Repositories;

namespace HwProj.NotificationsService.API.Repositories
{
    public interface IScheduleWorksRepository : ICrudRepository<ScheduleJob, string>
    {
    }


    public class ScheduleWorksRepository : CrudRepository<ScheduleJob, string>, IScheduleWorksRepository
    {
        public ScheduleWorksRepository(NotificationsContext context) : base(context)
        {
        }
    }
}