using System.Threading.Tasks;
using Hangfire;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Events.CourseEvents;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class DeleteTaskEventHandler : EventHandlerBase<DeleteTaskEvent>
    {
        private readonly IScheduleWorksRepository _scheduleWorksRepository;

        public DeleteTaskEventHandler(IScheduleWorksRepository scheduleWorksRepository)
        {
            _scheduleWorksRepository = scheduleWorksRepository;
        }

        public override async Task HandleAsync(DeleteTaskEvent @event)
        {
            var id = ScheduleWorkIdBuilder.Build(@event, @event.TaskId);
            var scheduleWork = await _scheduleWorksRepository.GetAsync(id);

            BackgroundJob.Delete(scheduleWork.JobId);
            
            await _scheduleWorksRepository.DeleteAsync(id);
        }
    }
}