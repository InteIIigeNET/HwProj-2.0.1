using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
    public class StudentProfile : IProfile
    {
        public string Id { get; set; }

        [Required]
        public string UserId { get; set; }
        public User User { get; set; }

        public long? DirectionId { get; set; }
        public Direction Direction { get; set; }

        public int? Group { get; set; }
        public int? Course { get; set; }

        public ICollection<Application> Applications { get; set; }

        public StudentProfile()
        {
            Applications = new List<Application>();
        }
    }
}
