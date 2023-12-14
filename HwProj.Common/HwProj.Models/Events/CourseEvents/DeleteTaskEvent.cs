using HwProj.EventBus.Client;

namespace HwProj.Models.Events.CourseEvents
{
    public class DeleteTaskEvent : Event
    {
        public long TaskId { get; set; }

        public DeleteTaskEvent(long taskId)
        {
            TaskId = taskId;
        }
    }
}