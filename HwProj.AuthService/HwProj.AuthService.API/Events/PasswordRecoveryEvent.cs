using HwProj.EventBus.Client;

namespace HwProj.AuthService.API.Events
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
