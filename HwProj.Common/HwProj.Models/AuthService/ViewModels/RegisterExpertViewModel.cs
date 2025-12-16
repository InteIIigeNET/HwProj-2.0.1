using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.AuthService.ViewModels
{
    public class RegisterExpertViewModel
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Surname { get; set; }

        public string? MiddleName { get; set; }

        [Required]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }

        public string? Bio { get; set; }

        public string? CompanyName { get; set; }

        public List<string> Tags { get; set; } = new List<string>();
    }
}