using System.ComponentModel.DataAnnotations;

namespace HwProj.AuthService.API.Models.ViewModels
{
    public class ChangeEmailViewModel
    {
        [Required]
        [EmailAddress]
        public string NewEmail { get; set; }
    }
}
