using System.ComponentModel.DataAnnotations;

namespace HwProj.AuthService.API.Models.ViewModels
{
    public class DeleteViewModel
    {
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
