using System;
using HwProj.EventBus.Client;
using HwProj.Models.Events.CourseEvents;

namespace HwProj.Models.NotificationsService
{
    public class ScheduleJob
    {
        public string Category { get; set; }

        public string EventName { get; set; }

        public long ItemId { get; set; }

        public string JobId { get; set; }

        public ScheduleJob(Event @event, long itemId, string jobId)
        {
            Category = ScheduleJobIdHelper.GetCategory(@event);
            EventName = ScheduleJobIdHelper.GetEventName(@event);
            ItemId = itemId;
            JobId = jobId;
        }

        public ScheduleJob(){}
    }


    public static class ScheduleJobIdHelper
    {
        public static string GetCategory(Event @event)
        {
            var eventType = @event.GetType();
            return @event.GetType() switch
            {
                _ when eventType == typeof(NewTaskEvent) || eventType == typeof(UpdateTaskEvent) ||
                       eventType == typeof(DeleteTaskEvent)
                    => "Task",
                _ when eventType == typeof(NewHomeworkEvent)
                    => "Homework",
                _ => "Unknown"
            };
        }

        public static string GetEventName(Event @event)
            => @event.ToString();
    }
}