using HwProj.EventBus.Client;

namespace HwProj.CourseWorkService.API.Events
{
    public class InviteLecturerEvent : Event
    {
        public string UserId { get; set; }

        public InviteLecturerEvent(string id)
        {
            UserId = id;
        }
    }
}
