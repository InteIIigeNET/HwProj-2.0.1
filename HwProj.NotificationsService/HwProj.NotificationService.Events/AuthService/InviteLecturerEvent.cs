using HwProj.EventBus.Client;

namespace HwProj.NotificationService.Events.AuthService
{
    public class InviteLecturerEvent : Event
    {
        public string UserId { get; set; }
        public string UserEmail { get; set; }
    }
}
