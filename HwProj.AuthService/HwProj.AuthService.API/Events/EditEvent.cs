using HwProj.EventBus.Client;

namespace HwProj.AuthService.API.Events
{
    public class EditEvent : Event
    {
        public string NewName { get; set; }
        public string NewSurname { get; set; }
        public string NewMiddleName { get; set; }
        public string UserId { get; set; }

        public EditEvent(string userId, string newName, string newSurname, string newMiddleName)
        {
            UserId = userId;
            NewName = newName;
            NewSurname = newSurname;
            NewMiddleName = newMiddleName;
        }
    }
}
