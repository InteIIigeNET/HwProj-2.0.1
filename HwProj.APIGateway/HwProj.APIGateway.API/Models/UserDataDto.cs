using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.DTO;

namespace HwProj.APIGateway.API.Models
{
    public class UserDataDto
    {
        public AccountDataDto UserData { get; set; }
        public CoursePreviewView[] Courses { get; set; }
        public TaskDeadlineDto[] TaskDeadlines { get; set; }
    }
}
