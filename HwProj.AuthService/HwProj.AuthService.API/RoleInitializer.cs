using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace HwProj.AuthService.API
{
    public class RoleInitializer
    {
        public static async Task InitializeAsync(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            if (await roleManager.FindByNameAsync("lecturer") == null)
            {
                await roleManager.CreateAsync(new IdentityRole("lecturer"));
            }

            if (await roleManager.FindByNameAsync("student") == null)
            {
                await roleManager.CreateAsync(new IdentityRole("student"));
            }
        }
    }
}
