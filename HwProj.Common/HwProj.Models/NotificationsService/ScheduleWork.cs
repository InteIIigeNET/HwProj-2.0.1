using System.ComponentModel.DataAnnotations;
using HwProj.EventBus.Client;
using HwProj.Events.CourseEvents;
using HwProj.Repositories;


namespace HwProj.Models.NotificationsService
{
    public class ScheduleWork : IEntity<string>
    {
        [Key] public string Id { get; set; }
        public string JobId { get; set; }
    }

    public static class ScheduleWorkIdBuilder
    {
        public static string Build(Event @event, long id)
        {
            //TODO: fill
            var eventType = @event.GetType();
            var category = eventType switch
            {
                _ when eventType == typeof(NewTaskEvent) || eventType == typeof(UpdateTaskEvent) ||
                       eventType == typeof(DeleteTaskEvent)
                    => "Task",
                _ when eventType == typeof(NewHomeworkEvent) 
                    => "Homework",
                _ => "Unknown"
            };

            return $"{category}/{id}";
        }
    }
}