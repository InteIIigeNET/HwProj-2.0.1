using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;

namespace HwProj.AuthService.API
{
    public class RoleInitializer
    {
        public static async Task InitializeAsync(UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            if (await roleManager.FindByNameAsync("lecturer") == null)
            {
                await roleManager.CreateAsync(new IdentityRole("lecturer"));
            }

            if (await roleManager.FindByNameAsync("student") == null)
            {
                await roleManager.CreateAsync(new IdentityRole("student"));
            }

            string email = "admin@gmail.com";
            string password = "Admin@1234";

            if (await userManager.FindByNameAsync(email) == null)
            {
                var admin = new User { Name = "admin",
                    Surname = "admin",
                    Email = email,
                    UserName = email };

                var result = await userManager.CreateAsync(admin, password);

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "lecturer");
                    admin.EmailConfirmed = true;
                    await userManager.UpdateAsync(admin);
                }
            }
        }
    }
}
