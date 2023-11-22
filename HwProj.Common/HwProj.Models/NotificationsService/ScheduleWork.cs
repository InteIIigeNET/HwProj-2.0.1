using System;
using System.ComponentModel.DataAnnotations;
using HwProj.EventBus.Client;
using HwProj.Models.Events.CourseEvents;
using HwProj.Repositories;

namespace HwProj.Models.NotificationsService
{
    public class ScheduleJob : IEntity<string>
    {
        [Key] public string Id { get; set; }
        public string JobId { get; set; }

        public ScheduleJob(ScheduleWorkId id, string jobId)
        {
            Id = id.ToString();
            JobId = jobId;
        }

        public ScheduleJob()
        {
        }
    }

    public class ScheduleWorkId
    {
        public string Category { get; set; }

        public string EventTypeName { get; set; }

        public long CategoryId { get; set; }

        public ScheduleWorkId(string category, string eventTypeName, long categoryId)
        {
            Category = category;
            EventTypeName = eventTypeName;
            CategoryId = categoryId;
        }


        public override string ToString()
        {
            return $"{Category}/{EventTypeName}/{CategoryId}";
        }
    }

    public static class ScheduleJobIdHelper
    {
        public static ScheduleWorkId BuildId(Event @event, long categoryId)
        {
            return new ScheduleWorkId(GetCategory(@event), @event.GetType().Name, categoryId);
        }

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

        public static ScheduleWorkId ParseId(string id)
        {
            var parts = id.Split('/');

            return new ScheduleWorkId(parts[0], parts[1], int.Parse(parts[2]));
        }
    }
}