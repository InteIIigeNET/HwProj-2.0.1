using HwProj.EventBus.Client;

namespace HwProj.CourseWorkService.API.Events
{
    public class InviteLecturerEvent : Event
    {
        public InviteLecturerEvent(string id)
        {
            UserId = id;
        }

        public string UserId { get; set; }
    }
}
