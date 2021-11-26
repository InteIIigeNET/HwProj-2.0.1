using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Models
{
    public static class IdentityResults
    {
        public static IdentityResult UserNotFound => IdentityResult.Failed(IdentityErrors.UserNotFound);
        public static IdentityResult WrongPassword => IdentityResult.Failed(IdentityErrors.WrongPassword);

        public static IdentityResult UserExists =>
            IdentityResult.Failed(new IdentityError { Description = "User exists" });
    }

    public static class IdentityErrors
    {
        public static IdentityError EmailNotConfirmed => new IdentityError { Description = "Email not confirmed" };
        public static IdentityError UserNotFound => new IdentityError { Description = "User not found" };
        public static IdentityError WrongPassword => new IdentityError { Description = "Wrong login or password" };
        public static IdentityError PasswordTooShort => new IdentityError { Description = "Пароль должен содержать не менее 6 символов" };
    }
}
