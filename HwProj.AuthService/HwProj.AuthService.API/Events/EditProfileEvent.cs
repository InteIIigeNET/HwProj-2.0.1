using HwProj.EventBus.Client;

namespace HwProj.AuthService.API.Events
{
    public class EditProfileEvent : Event
    {
        public string UserId { get; set; }

        public EditProfileEvent(string userId)
        {
            UserId = userId;
        }
    }
}
