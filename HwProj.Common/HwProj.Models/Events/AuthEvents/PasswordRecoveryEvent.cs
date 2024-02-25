using HwProj.EventBus.Client;

namespace HwProj.Models.Events.AuthEvents
{
    public class PasswordRecoveryEvent : Event
    {
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
        public override string EventName => "PasswordRecoveryEvent";
        public override EventCategory Category => EventCategory.Users;
    }
}
