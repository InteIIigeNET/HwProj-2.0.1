using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace HwProj.Models.AuthService.ViewModels
{
    public class RegisterExpertViewModel
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Surname { get; set; }

        public string MiddleName { get; set; }

        [Required]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }

        public string Bio { get; set; }

        [Required]
        public int CourseId { get; set; }

        [Required]
        public int HomeworkId { get; set; }

        [Required]
        public DateTime TokenExpirationTime { get; set; }
    }
}