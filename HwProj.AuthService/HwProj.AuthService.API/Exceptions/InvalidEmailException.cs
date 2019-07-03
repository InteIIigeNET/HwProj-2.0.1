using System;

namespace HwProj.AuthService.API.Exceptions
{
    public class InvalidEmailException : Exception
    {
        public InvalidEmailException(string message)
            : base(message)
        {
        }
    }
}
