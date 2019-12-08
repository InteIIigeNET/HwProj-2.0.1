using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class Group : IEntity
    {
        [Key]
        public long Id { get; set;  }

        public long CourseId { get; set; }

        public string Name { get; set; }

        public List<GroupMate> GroupMates { get; set; } = new List<GroupMate>();

        public bool IsForAllTasks { get; set; }

        public List<long> Tasks { get; set; } = new List<long>();
    }
}
