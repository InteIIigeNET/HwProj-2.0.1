using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.Models.Events.CourseEvents
{
    public class AddOrUpdateTaskEvent : Event
    {
        public bool IsUpdate { get; set; }
        public long TaskId { get; set; }
        public override string EventName => "UpdateTaskEvent";
        public override EventCategory Category => EventCategory.Tasks;
        
        public AddOrUpdateTaskEvent(long taskId, bool isUpdate)
        {
            TaskId = taskId;
            IsUpdate = isUpdate;
        }
    }
}