using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Models
{
    public class User : IdentityUser
    {
        public string GitHubId { get; set; }

        public string Name { get; set; }

        public string Surname { get; set; }

        public string MiddleName { get; set; }

        public User()
        {
        }
    }
}
