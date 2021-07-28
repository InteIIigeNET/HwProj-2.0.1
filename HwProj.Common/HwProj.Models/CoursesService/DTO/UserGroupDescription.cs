using HwProj.CoursesService.API.Models.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models.DTO
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
