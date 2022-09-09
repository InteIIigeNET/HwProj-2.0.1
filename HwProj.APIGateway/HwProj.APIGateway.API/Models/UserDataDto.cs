using HwProj.Models.AuthService.DTO;

namespace HwProj.APIGateway.API.Models
{
    public class UserDataDto
    {
        public AccountDataDto UserData { get; set; }
        public CoursePreviewView[] Courses { get; set; }
    }
}
