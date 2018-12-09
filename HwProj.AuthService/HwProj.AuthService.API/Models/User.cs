using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Models
{
    public class User : IdentityUser
    {
        public string Name { get; set; }
        public string Surname { get; set; }

        public User(string name, string surname, string email)
        {
            Name = name;
            Surname = surname;
            Email = email;
        }
    }
}
