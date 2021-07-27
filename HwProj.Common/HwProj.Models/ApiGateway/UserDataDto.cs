using HwProj.Models.AuthService.DTO;
using HwProj.Models.NotificationsService;

namespace HwProj.Models.ApiGateway
{
    public class UserDataDto
    {
        public AccountDataDto UserData { get; set; }
        public NotificationViewModel[] Notifications { get; set; }
    }
}
