using System.ComponentModel.DataAnnotations;

namespace HwProj.AuthService.API.ViewModels
{
    public class EditViewModel
    {
        public string NewName { get; set; }

        public string NewSurname { get; set; }

        [DataType(DataType.EmailAddress)]
        public string NewEmail { get; set; }
    }
}
