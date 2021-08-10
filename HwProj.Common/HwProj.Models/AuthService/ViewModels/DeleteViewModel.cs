using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.AuthService.ViewModels
{
    public class DeleteViewModel
    {
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
