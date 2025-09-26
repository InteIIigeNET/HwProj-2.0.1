using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.Roles;
using HwProj.NotificationService.Events.AuthService;
using User = HwProj.AuthService.API.Models.User;

namespace HwProj.AuthService.API
{
    public class RoleInitializer
    {
        private static IdentityRole _lecturer = new IdentityRole(Roles.LecturerRole);
        private static IdentityRole _student = new IdentityRole(Roles.StudentRole);
        private static IdentityRole _expert = new IdentityRole(Roles.ExpertRole);

        public static async Task InitializeAsync(UserManager<User> userManager, RoleManager<IdentityRole> roleManager, IEventBus eventBus)
        {
            if(await roleManager.FindByNameAsync(Roles.LecturerRole) == null)
            {
                await roleManager.CreateAsync(_lecturer);
            }

            if (await roleManager.FindByNameAsync(Roles.StudentRole) == null)
            {
                await roleManager.CreateAsync(_student);
            }

            if (await roleManager.FindByNameAsync(Roles.ExpertRole) == null)
            {
                await roleManager.CreateAsync(_expert);
            }

            const string email = "admin@gmail.com";
            const string password = "Admin@1234";

            if (await userManager.FindByEmailAsync(email) == null)
            {
                var admin = new User {
                    Email = email,
                    Name = "Admin",
                    UserName = "Admin"
                };

                var result = await userManager.CreateAsync(admin, password);

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, Roles.LecturerRole); //TODO: dangerous
                    admin.EmailConfirmed = true;
                    await userManager.UpdateAsync(admin);
                    var @event = new AdminRegisterEvent(admin.Id, admin.Email, admin.Name);
                    eventBus.Publish(@event);
                }
            }
        }
    }
}
