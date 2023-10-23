using System.Threading.Tasks;
using HwProj.Models.NotificationsService;


namespace HwProj.NotificationsService.API.Repositories;

public interface IScheduleWorksRepository
{
    Task AddAsync(ScheduleWork work);

    Task DeleteAsync((long? taskId, long? homeworkId, long? courseId, string categoryId) id);
}