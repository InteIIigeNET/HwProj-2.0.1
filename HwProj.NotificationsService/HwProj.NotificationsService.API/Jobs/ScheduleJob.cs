using HwProj.EventBus.Client;

namespace HwProj.NotificationsService.API.Jobs
{
    public class ScheduleJob
    {
        public EventCategory Category { get; set; }
        public string EventName { get; set; }
        public long ItemId { get; set; }
        public string JobId { get; set; }

        public ScheduleJob(Event @event, long itemId, string jobId)
        {
            Category = @event.Category;
            EventName = @event.EventName;
            ItemId = itemId;
            JobId = jobId;
        }

        public ScheduleJob()
        {
        }
    }
}
