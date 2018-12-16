using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Models
{
    public class User : IdentityUser
    {
        public string Name { get; set; }

        public string Surname { get; set; }

        public User()
        {

        }
    }
}
