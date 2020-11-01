using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public class Department : IEntity<long>
    {
        public long Id { get; set; }

        public string Name { get; set; }

        public ICollection<LecturerProfile> LecturerProfiles { get; set; }
        public ICollection<CuratorProfile> CuratorProfiles { get; set; }

        public Department()
        {
            LecturerProfiles = new List<LecturerProfile>();
            CuratorProfiles = new List<CuratorProfile>();
        }
    }
}
