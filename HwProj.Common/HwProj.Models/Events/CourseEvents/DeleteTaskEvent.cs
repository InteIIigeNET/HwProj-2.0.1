using HwProj.EventBus.Client;

namespace HwProj.Models.Events.CourseEvents
{
    public class DeleteTaskEvent : Event
    {
        public long TaskId { get; set; }
        public override string EventName => "DeleteTaskEvent";
        public override EventCategory Category => EventCategory.Tasks;

        public DeleteTaskEvent(long taskId)
        {
            TaskId = taskId;
        }
    }
}
