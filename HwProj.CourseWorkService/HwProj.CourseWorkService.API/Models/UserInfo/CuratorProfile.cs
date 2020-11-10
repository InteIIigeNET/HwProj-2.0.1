using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
    public class CuratorProfile : IProfile
    {
        public string Id { get; set; }
            
        [Required]
        public string UserId { get; set; }
        public User User { get; set; }

        public long? DepartmentId { get; set; }
        public Department Department { get; set; }

        public ICollection<Direction> Directions { get; set; }

        public CuratorProfile()
        {
            Directions = new List<Direction>();
        }
    }
}
