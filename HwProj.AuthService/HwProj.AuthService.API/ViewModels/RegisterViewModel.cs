using System.ComponentModel.DataAnnotations;

namespace HwProj.AuthService.API.ViewModels
{
    public class RegisterViewModel
    {
        [Required]
        public string UserName { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Surname { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        //[DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
