using System;

namespace HwProj.AuthService.API.Exceptions
{
    public class InvalidPasswordException : Exception
    {
        private const string message = "Неверный пароль";

        public InvalidPasswordException()
            : base(message)
        {
        }
    }
}
