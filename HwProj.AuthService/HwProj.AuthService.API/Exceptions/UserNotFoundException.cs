using System;

namespace HwProj.AuthService.API.Exceptions
{
    public class UserNotFoundException : Exception
    {
        private const string message = "Пользователь не найден";

        public UserNotFoundException()
            : base(message)
        {
        }
    }
}
