using HwProj.EventBus.Client;

namespace HwProj.NotificationService.Events.AuthService
{
    public class PasswordRecoveryEvent : Event
    {
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
    }
}
