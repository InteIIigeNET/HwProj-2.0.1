using System;

namespace HwProj.AuthService.API.Exceptions
{
    public class FailedLogInGitHubException : Exception
    {
        private const string message = "Неудачная попытка входа через GitHub";

        public FailedLogInGitHubException()
            : base(message)
        {
        }
    }
}