using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public class StudentProfile : IEntity<string>
    {
        public string Id { get; set; }

        public string UserId { get; set; }
        public User User { get; set; }

        public int Group { get; set; }
        public string Direction { get; set; }
        public ICollection<Application> Applications { get; set; }

        public StudentProfile()
        {
            Applications = new List<Application>();
        }
    }
}
