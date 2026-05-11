namespace HwProj.NotificationService.Events.AuthService
{
    public class AuthRegisterEvent : RegisterEvent
    {
        public AuthRegisterEvent(string userId, string email, string name, string surname = "", string middleName = "")
            : base(userId, email, name, surname, middleName)
        {
        }
        public string ChangePasswordToken { get; set; }
    }
}
