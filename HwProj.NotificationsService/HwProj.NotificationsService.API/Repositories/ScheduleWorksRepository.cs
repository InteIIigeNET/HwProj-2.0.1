
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
    }
}