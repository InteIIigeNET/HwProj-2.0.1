using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class UpdateTaskMaxRatingEvent : Event
    {
        public UpdateTaskMaxRatingEvent(CourseViewModel course, HomeworkTaskViewModel task, int rating)
        {
            Course = course;
            Task = task;
            MaxRating = rating;
        }

        public CourseViewModel Course { get; set; }
        public HomeworkTaskViewModel Task { get; set; }
        public int MaxRating { get; set; }
    }
}
