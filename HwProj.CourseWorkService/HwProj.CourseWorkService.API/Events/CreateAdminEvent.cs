namespace HwProj.CourseWorkService.API.Events
{
    public class CreateAdminEvent : RegisterEvent
    {
        public CreateAdminEvent(string userId, string userName, string userEmail) : base(userId, userName, userEmail)
        {

        }
    }
}
