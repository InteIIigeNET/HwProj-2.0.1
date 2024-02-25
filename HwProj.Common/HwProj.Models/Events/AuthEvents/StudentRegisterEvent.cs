using HwProj.EventBus.Client;

namespace HwProj.Models.Events.AuthEvents
{
    public class StudentRegisterEvent : RegisterEvent
    {
        public StudentRegisterEvent(string userId, string email, string name, string surname = "",
            string middleName = "")
            : base(userId, email, name, surname, middleName)
        {
        }

        public override string EventName => "StudentRegisterEvent";
        public override EventCategory Category => EventCategory.Users;
    }
}
