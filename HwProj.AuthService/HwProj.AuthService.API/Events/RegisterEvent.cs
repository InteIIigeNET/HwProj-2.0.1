using HwProj.EventBus.Client;

namespace HwProj.AuthService.API.Events
{
    public class RegisterEvent : Event
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }

        public RegisterEvent(string userId, string userName, string email)
        {
            UserId = userId;
            UserName = userName;
            Email = email;
        }
    }
}
