using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace HwProj.Models.ContentService.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class MaxFileSizeAttribute : FileValidationAttribute
    {
        private readonly long _maxFileSizeInBytes;

        public MaxFileSizeAttribute(long maxFileSizeInBytes)
            => _maxFileSizeInBytes = maxFileSizeInBytes;

        protected override ValidationResult Validate(IFormFile file)
        {
            if (file.Length > _maxFileSizeInBytes)
                return new ValidationResult(
                    $"Файл `{file.FileName}` превышает лимит в {_maxFileSizeInBytes / 1024 / 1024} MB");

            return ValidationResult.Success;
        }
    }
}
