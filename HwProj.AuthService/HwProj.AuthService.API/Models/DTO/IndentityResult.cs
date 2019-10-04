using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Models.DTO
{
    public sealed class IdentityResult<T> where T : class
    {
        public T Value { get; }
        public bool Succeeded { get; }
        public IEnumerable<IdentityError> Errors { get; }

        private IdentityResult(T value)
        {
            Succeeded = true;
            Value = value;
        }

        private IdentityResult(params IdentityError[] errors)
        {
            Succeeded = false;
            Errors = errors;
        }

        public static IdentityResult<T> Success(T value)
        {
            return new IdentityResult<T>(value);
        }

        public static IdentityResult<T> Failed(params IdentityError[] errors)
        {
            return new IdentityResult<T>(errors);
        }
    }
}