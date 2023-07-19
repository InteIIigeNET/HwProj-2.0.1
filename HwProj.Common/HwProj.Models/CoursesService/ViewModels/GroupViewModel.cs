using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class GroupViewModel
    {
        public long Id { get; set; }
        public string[] StudentsIds { get; set; }
    }

    public class CreateGroupViewModel
    {
        public string Name { get; set; }

        [Required]
        public string[] GroupMatesIds { get; set; }

        [Required]
        public long CourseId { get; set; }

        public CreateGroupViewModel(string[] groupMatesIds, long courseId)
        {
            Name = "";
            GroupMatesIds = groupMatesIds;
            CourseId = courseId;
        }

    }

    public class UpdateGroupViewModel
    {
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Name { get; set; }

        public List<long> Tasks { get; set; } = new List<long>();

        public List<GroupMateViewModel> GroupMates { get; set; }
    }
}
