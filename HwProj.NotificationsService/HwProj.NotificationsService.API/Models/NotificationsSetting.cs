namespace HwProj.NotificationsService.API.Models
{
    public class NotificationsSetting
    {
        public string UserId { get; set; }
        public string Category { get; set; }
        public bool IsEnabled { get; set; }
    }

    public static class NotificationsSettingCategory
    {
        public const string NewSolutionsCategory = "newSolutions";
        public const string InviteLecturerCategory = "inviteLecturer";
        public const string LecturerInvitedToCourseCategory = "lecturerInvitedToCourse";
        public const string NewCourseMateCategory = "newCourseMate";
    }
}
