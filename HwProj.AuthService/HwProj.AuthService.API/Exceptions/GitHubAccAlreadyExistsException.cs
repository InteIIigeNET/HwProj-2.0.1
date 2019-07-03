using System;

namespace HwProj.AuthService.API.Exceptions
{
    public class GitHubAccAlreadyExistsException : Exception
    {
        private const string message = "Попытка привязать второй аккаунт github";

        public GitHubAccAlreadyExistsException()
            : base(message)
        {
        }
    }
}