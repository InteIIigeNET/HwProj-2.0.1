using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HwProj.CoursesService.API.Models.ViewModels
{
    public class GroupViewModel
    {
        public string GroupId { get; set; }

        public string Name { get; set; }

        public List<CourseMateViewModel> GroupMates { get; set; } = new List<CourseMateViewModel>();
    }

    public class CreateGroupViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Name { get; set; }
    }
}
