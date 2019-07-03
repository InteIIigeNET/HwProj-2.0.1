using System.ComponentModel.DataAnnotations;

namespace HwProj.AuthService.API.ViewModels
{
    public class InviteLecturerViewModel
    {
        [Required]
        [EmailAddress]
        public string EmailOfInvitedPerson { get; set; }
    }
}
