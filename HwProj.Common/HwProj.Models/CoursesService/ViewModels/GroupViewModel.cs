using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class GroupViewModel
    {
        public long Id { get; set; }

        public long CourseId { get; set; }

        public string Name { get; set; }
        
        public List<GroupMateViewModel> GroupMates { get; set; } = new List<GroupMateViewModel>();
    }

    public class CreateGroupViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Name { get; set; }
        
        public List<GroupMateViewModel> GroupMates { get; set; }
    }

    public class UpdateGroupViewModel
    {
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Name { get; set; }

        public List<GroupMateViewModel> GroupMates { get; set; }
    }
}
