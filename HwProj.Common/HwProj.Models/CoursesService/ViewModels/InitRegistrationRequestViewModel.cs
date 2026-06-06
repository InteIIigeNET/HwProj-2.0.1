using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class InitRegistrationRequestViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Name { get; set; }

        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Surname shouldn't start with white spaces.")]
        public string Surname { get; set; }

        [RegularExpression(@"^\S+.*", ErrorMessage = "MiddleName shouldn't start with white spaces.")]
        public string MiddleName { get; set; } = string.Empty;

        public long? CourseId { get; set; }

        public RequestedRole RequestedRole { get; set; } = RequestedRole.Student;
        
        public string? Description { get; set; }
        
        [EmailAddress]
        public string? PreferredLecturerEmail { get; set; }
    }
}
