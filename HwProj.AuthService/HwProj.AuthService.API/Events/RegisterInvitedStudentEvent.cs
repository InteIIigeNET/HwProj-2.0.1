namespace HwProj.AuthService.API.Events
{
    public class RegisterInvitedStudentEvent : RegisterEvent
    {
        public RegisterInvitedStudentEvent(string userId, string email, string name, string surname = "", string middleName = "")
            : base(userId, email, name, surname, middleName)
        {
        }
        public string AuthToken { get; set; }
    }
}