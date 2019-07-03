using System;

namespace HwProj.AuthService.API.Exceptions
{
    public class UserNotSignInException : Exception
    {
        private const string message = "Вход не выполнен";

        public UserNotSignInException()
            : base(message)
        {
        }
    }
}
