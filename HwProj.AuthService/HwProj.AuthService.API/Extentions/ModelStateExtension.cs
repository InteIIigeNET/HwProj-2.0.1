using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace HwProj.AuthService.API.Extentions
{
    public static class ModelStateExtension
    {
        public static void AddModelErrors(this ModelStateDictionary modelState, IdentityError[] errors)
        {
            foreach (var error in errors)
            {
                modelState.AddModelError("", error.Description);
            }
        }
    }
}
