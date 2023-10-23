using System.ComponentModel.DataAnnotations;
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
        public static string Build(string eventName, long id)
        {
            //TODO: fill
            var category = eventName switch
            {
                _ when eventName.Equals("NewHomeworkTaskEvent") || eventName.Equals("UpdateTaskMaxRatingEvent") ||
                       eventName.Equals("UpdateSolutionMaxRatingEvent")
                    => "Task",
                _ when eventName.Equals("NewHomeworkEvent")
                    => "Homework",
                _ => "Unknown"
            };

            return $"{category}/{id}";
        }
    }
}