namespace HwProj.NotificationService.Events.AuthService
{
    public class StudentRegisterEvent : RegisterEvent
    {
        public StudentRegisterEvent(string userId, string email, string name, string surname = "", string middleName = "")
            : base(userId, email, name, surname, middleName)
        {
        }
        public string ChangePasswordToken { get; set; }
    }
}
