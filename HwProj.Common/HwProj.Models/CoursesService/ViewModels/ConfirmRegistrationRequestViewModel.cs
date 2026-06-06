using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class ConfirmRegistrationRequestViewModel
    {
        [Required]
        public string Token { get; set; }
    }
}
