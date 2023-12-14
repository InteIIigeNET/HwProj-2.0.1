using HwProj.APIGateway.API.Models.Tasks;
using HwProj.Models.AuthService.DTO;

namespace HwProj.APIGateway.API.Models
{
    public class UserDataDto
    {
        public AccountDataDto UserData { get; set; }
        public CourseEvents[] CourseEvents { get; set; }
        public TaskDeadlineView[] TaskDeadlines { get; set; }
    }
}
