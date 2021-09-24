using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.AuthService.ViewModels
{
    public class EditAccountViewModel
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Surname { get; set; }
        
        public string MiddleName { get; set; }
        
        [Required]
        [DataType(DataType.Password)]
        public string CurrentPassword { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [StringLength(100, ErrorMessage = "Пароль должен содержать не менее 6 символов", MinimumLength = 6)]
        public string NewPassword { get; set; }
    }
}
