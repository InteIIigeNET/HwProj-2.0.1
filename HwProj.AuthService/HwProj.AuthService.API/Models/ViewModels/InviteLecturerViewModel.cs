using System.ComponentModel.DataAnnotations;

namespace HwProj.AuthService.API.Models.ViewModels
{
    public class InviteLecturerViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
