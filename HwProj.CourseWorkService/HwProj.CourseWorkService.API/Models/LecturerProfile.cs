using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public class LecturerProfile : IEntity<string>
    {
        public string Id { get; set; }

        public string UserId { get; set; }
        public User User { get; set; }

        public string Department { get; set; }
    }
}
