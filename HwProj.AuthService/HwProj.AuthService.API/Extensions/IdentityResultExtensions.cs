using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Extensions
{
    public static class IdentityResultExtensions
    {
        public static async Task<IdentityResult> Then(this Task<IdentityResult> task,
            Func<Task<IdentityResult>> continuation)
        {
            var result = await task.ConfigureAwait(false);
            return result.Succeeded
                ? await continuation().ConfigureAwait(false)
                : result;
        }

        public static string TryGetIdentityError(this SignInResult result)
        {
            if (result.IsLockedOut)
            {
                return nameof(result.IsLockedOut);
            }

            if (result.IsNotAllowed)
            {
                return nameof(result.IsNotAllowed);
            }

            if (result.RequiresTwoFactor)
            {
                return nameof(result.RequiresTwoFactor);
            }
            
            return IdentityErrors.WrongPassword.Description;
        }
    }
}