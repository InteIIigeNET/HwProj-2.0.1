using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using HwProj.Models.Roles;

namespace HwProj.AuthService.API
{
    public class RoleInitializer
    {
        public static async Task InitializeAsync(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            if(await roleManager.FindByNameAsync(Roles.LecturerRole) == null)
            {
                await roleManager.CreateAsync(Roles.Lecturer);
            }
  
            if (await roleManager.FindByNameAsync(Roles.StudentRole) == null)
            {
                await roleManager.CreateAsync(Roles.Student);
            }

            const string email = "admin@gmail.com";
            const string password = "Admin@1234";

            if (await userManager.FindByNameAsync(email) == null)
            {
                var admin = new User { 
                    Email = email,
                    UserName = "Admin admin"
                };

                var result = await userManager.CreateAsync(admin, password);

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, Roles.LecturerRole); //TODO: dangerous
                    admin.EmailConfirmed = true;
                    await userManager.UpdateAsync(admin);
                }
            }

            //await userManager.FindByEmailAsync(email).Result.Id;
        }
    }
}
