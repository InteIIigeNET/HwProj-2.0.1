using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels;

public class GroupViewModel
{
    public long Id { get; set; }

    public long CourseId { get; set; }

    public string Name { get; set; }

    public List<long> Tasks { get; set; } = new();

    public List<GroupMateViewModel> GroupMates { get; set; } = new();
}

public class CreateGroupViewModel
{
    [Required]
    [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
    public string Name { get; set; }

    [Required] public List<GroupMateViewModel> GroupMates { get; set; } = new();

    [Required]
    public long CourseId { get; set; }

    [Required]
    public List<long> Tasks { get; set; } = new();
}

public class UpdateGroupViewModel
{
    [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
    public string Name { get; set; }

    public List<long> Tasks { get; set; } = new();

    public List<GroupMateViewModel> GroupMates { get; set; }
}