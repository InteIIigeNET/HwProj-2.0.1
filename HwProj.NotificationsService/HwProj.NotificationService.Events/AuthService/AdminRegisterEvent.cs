namespace HwProj.NotificationService.Events.AuthService
{
    public class AdminRegisterEvent : RegisterEvent
    {
        public AdminRegisterEvent(string userId, string email, string name, string surname = "", string middleName = "") 
            : base(userId, email, name, surname, middleName)
        {

        }
    }
}
