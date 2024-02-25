using HwProj.EventBus.Client;

namespace HwProj.Models.Events.AuthEvents
{
    public class InviteLecturerEvent : Event
    {
        public string UserId { get; set; }
        public string UserEmail { get; set; }
        public override string EventName => "InviteLecturerEvent";
        public override EventCategory Category => EventCategory.Users;
    }
}
