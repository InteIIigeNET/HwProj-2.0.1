using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.AuthService.ViewModels
{
    public class EditAccountViewModel
    {
        [Required] public string Name { get; set; }

        [Required] public string Surname { get; set; }

        public string MiddleName { get; set; }
    }
}