using HwProj.Models.NotificationsService;
using HwProj.Repositories;

namespace HwProj.NotificationsService.API.Repositories;

public interface IScheduleWorksRepository : ICrudRepository<ScheduleWork, long>
{
    
}