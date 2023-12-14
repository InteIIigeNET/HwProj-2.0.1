using System.Threading.Tasks;
using Hangfire;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.Events.CourseEvents;
using HwProj.NotificationsService.API.Repositories;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class DeleteTaskEventHandler : EventHandlerBase<DeleteTaskEvent>
    {
        private readonly IScheduleJobsRepository _scheduleJobsRepository;

        public DeleteTaskEventHandler(IScheduleJobsRepository scheduleJobsRepository)
        {
            _scheduleJobsRepository = scheduleJobsRepository;
        }

        public override async Task HandleAsync(DeleteTaskEvent @event)
        {
            await EventHandlerExtensions<DeleteTaskEvent>.DeleteScheduleJobsAsync(@event, @event.TaskId,
                _scheduleJobsRepository);
        }
    }
}