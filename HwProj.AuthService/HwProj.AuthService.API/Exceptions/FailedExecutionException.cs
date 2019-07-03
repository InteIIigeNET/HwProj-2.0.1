using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace HwProj.AuthService.API.Exceptions
{
    public class FailedExecutionException : Exception
    {
        private const string message = "Ошибка выполнения запроса";

        public IEnumerable<IdentityError> Errors { get; }

        public FailedExecutionException(IEnumerable<IdentityError> errors)
            : base(message)
        {
            Errors = errors;
        }

        public FailedExecutionException()
            : base(message)
        {
        }
    }
}
