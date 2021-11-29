using System.Collections.Generic;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public class Direction : IEntity<long>
    {
        public Direction()
        {
            StudentProfiles = new List<StudentProfile>();
        }

        public string Name { get; set; }

        public string CuratorProfileId { get; set; }
        public CuratorProfile CuratorProfile { get; set; }

        public ICollection<StudentProfile> StudentProfiles { get; set; }
        public long Id { get; set; }
    }
}
