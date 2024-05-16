using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.AuthService.ViewModels
{
    public class EditExpertViewModel
    {
        public string Name { get; set; }

        public string Surname { get; set; }

        public string MiddleName { get; set; }

        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }

        public string Bio { get; set; }
        
        public string CompanyName { get; set; }
    }
}
