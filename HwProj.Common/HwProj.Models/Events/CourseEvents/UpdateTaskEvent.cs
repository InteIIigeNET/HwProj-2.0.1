using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.Models.Events.CourseEvents
{
    public class UpdateTaskEvent : Event
    {
        public long TaskId { get; set; }

        public HomeworkTaskDTO PreviousEvent { get; set; }

        public HomeworkTaskDTO NewEvent { get; set; }

        public CourseDTO Course { get; set; }

        public override string EventName => "UpdateTaskEvent";
        public override EventCategory Category => EventCategory.Tasks;

        public UpdateTaskEvent(long taskId, HomeworkTaskDTO previousEvent, HomeworkTaskDTO newEvent, CourseDTO course)
        {
            TaskId = taskId;
            PreviousEvent = previousEvent;
            NewEvent = newEvent;
            Course = course;
        }
    }
}
