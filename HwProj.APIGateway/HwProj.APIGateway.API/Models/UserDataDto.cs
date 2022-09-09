using HwProj.Models.AuthService.DTO;
using HwProj.Models.NotificationsService;

namespace HwProj.APIGateway.API.Models
{
    public class UserDataDto
    {
        public AccountDataDto UserData { get; set; }
        public CategorizedNotifications[] Notifications { get; set; }
        public CoursePreviewView[] Courses { get; set; }
    }
}
