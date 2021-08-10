using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.AuthService.ViewModels
{
    public class ChangeEmailViewModel
    {
        [Required]
        [EmailAddress]
        public string NewEmail { get; set; }
    }
}
