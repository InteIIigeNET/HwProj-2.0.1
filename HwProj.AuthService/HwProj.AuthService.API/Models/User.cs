using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Models
{
    public class User : IdentityUser
    {
        public string GitHubId { get; set; }

        public User()
        {
        }
    }
}
