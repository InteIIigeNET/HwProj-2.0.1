namespace HwProj.AuthService.API.Events
{
    public class CreateAdminEvent : RegisterEvent
    {
        public CreateAdminEvent(string userId, string userName, string email) : base(userId, userName, email)
        {
        }
    }
}
