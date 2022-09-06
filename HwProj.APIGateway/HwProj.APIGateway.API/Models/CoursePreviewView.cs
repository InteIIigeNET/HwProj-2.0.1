using HwProj.Models.AuthService.DTO;

namespace HwProj.APIGateway.API.Models
{
    public class CoursePreviewView
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string GroupName { get; set; }
        public bool IsCompleted { get; set; }
        public AccountDataDto[] Mentors { get; set; }
    }
}
