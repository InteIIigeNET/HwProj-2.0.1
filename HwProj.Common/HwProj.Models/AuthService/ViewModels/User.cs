﻿using Microsoft.AspNetCore.Identity;

namespace HwProj.Models.AuthService.ViewModels
{
    public class User : IdentityUser
    {
        public string GitHubId { get; set; }

        public string Name { get; set; }

        public string Surname { get; set; }

        public string MiddleName { get; set; }

        public bool IsExternalAuth { get; set; }

        public string Bio { get; set; }
        
        public string CompanyName { get; set; }

        public User()
        {
        }
    }
}
