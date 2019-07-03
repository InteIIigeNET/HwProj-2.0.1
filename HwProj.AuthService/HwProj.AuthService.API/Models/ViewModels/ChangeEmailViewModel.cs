using System.ComponentModel.DataAnnotations;

namespace HwProj.AuthService.API.ViewModels
{
    public class ChangeEmailViewModel
    {
        [Required]
        [EmailAddress]
        public string NewEmail { get; set; }
    }
}
