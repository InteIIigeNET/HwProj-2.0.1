using System.Collections.Generic;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.Models.CoursesService.DTO
{
    public class UserGroupDescription
    {
        public long Id { get; set; }

        public long CourseId { get; set; }

        public string Name { get; set; }

        public List<long> Tasks { get; set; } = new List<long>();

        public List<GroupMateViewModel> GroupMates { get; set; } = new List<GroupMateViewModel>();
    }
}
