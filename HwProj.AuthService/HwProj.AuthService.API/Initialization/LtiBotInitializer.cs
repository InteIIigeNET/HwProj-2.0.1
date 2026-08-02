using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Initialization
{
    public static class LtiBotInitializer
    {
        private const string Email = "ltibot@gmail.com";

        public static async Task InitializeAsync(UserManager<User> userManager)
        {
            var bot = await userManager.FindByEmailAsync(Email);

            if (bot == null)
            {
                bot = new User
                {
                    UserName = Email,
                    Email = Email,
                    EmailConfirmed = true,
                    Name = "LTI Bot",
                    Surname = "",
                    MiddleName = "",
                    IsExternalAuth = false
                };

                var createResult =
                    await userManager.CreateAsync(bot);

                if (!createResult.Succeeded)
                {
                    ThrowErrors(
                        "Не удалось создать LTI-бота",
                        createResult);
                }
            }

            var isExpert =
                await userManager.IsInRoleAsync(
                    bot,
                    Roles.ExpertRole);

            if (!isExpert)
            {
                var roleResult =
                    await userManager.AddToRoleAsync(
                        bot,
                        Roles.ExpertRole);

                if (!roleResult.Succeeded)
                {
                    ThrowErrors(
                        "Не удалось назначить LTI-боту роль Expert",
                        roleResult);
                }
            }
        }

        private static void ThrowErrors(
            string message,
            IdentityResult result)
        {
            var errors = string.Join(
                "; ",
                result.Errors.Select(error => error.Description));

            throw new InvalidOperationException(
                $"{message}: {errors}");
        }
    }
}