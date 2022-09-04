using HwProj.EventBus.Client;

namespace HwProj.AuthService.API.Events
{
    public class InviteLecturerEvent : Event
    {
        public string UserId { get; set; }
        public string UserEmail { get; set; }
    }
}
