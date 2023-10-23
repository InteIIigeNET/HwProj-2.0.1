using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class UpdateTaskMaxRatingEvent : Event
    {
        public CourseDTO Course { get; set; }
        public HomeworkTaskViewModel Task { get; set; }
        public int MaxRating { get; set; }

        public UpdateTaskMaxRatingEvent(CourseDTO course, HomeworkTaskViewModel task, int rating)
        {
            Course = course;
            Task = task;
            MaxRating = rating;
        }
    }
}
