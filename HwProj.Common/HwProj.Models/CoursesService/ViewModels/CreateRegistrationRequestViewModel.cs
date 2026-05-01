using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class CreateRegistrationRequestViewModel
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
        
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "MiddleName shouldn't start with white spaces.")]
        public string MiddleName { get; set; }
        
        [Required]
        public string ScopeType { get; set; }
        
        public long? CourseId { get; set; }
        
        [Required]
        public string SourceType { get; set; }
    }
}