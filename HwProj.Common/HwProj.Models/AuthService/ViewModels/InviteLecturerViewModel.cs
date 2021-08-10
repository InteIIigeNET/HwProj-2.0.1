using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.AuthService.ViewModels
{
    public class InviteLecturerViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
