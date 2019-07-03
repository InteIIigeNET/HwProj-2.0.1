using HwProj.AuthService.API.ViewModels;
using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Models
{
    public class User : IdentityUser
    {
        public string Name { get; set; }

        public string Surname { get; set; }

        public string IdGitHub { get; set; }

        public User()
        {

        }

        public static explicit operator User(RegisterViewModel model)
        {
            return new User()
            {
                UserName = model.Email,
                Name = model.Name,
                Surname = model.Surname,
                Email = model.Email
            };
        }

        public static explicit operator User(RegisterGitHubViewModel model)
        {
            return new User()
            {
                UserName = model.Email,
                Name = model.Name,
                Surname = model.Surname,
                Email = model.Email
            };
        }
    }
}
