using System.ComponentModel.DataAnnotations;

namespace HwProj.AuthService.API.ViewModels
{
    public class DeleteViewModel
    {
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
