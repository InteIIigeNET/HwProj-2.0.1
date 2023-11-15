using HwProj.EventBus.Client;

namespace HwProj.Events.CourseEvents
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