using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace HwProj.Models.ContentService.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class MaxFileSizeAttribute : ValidationAttribute
    {
        private readonly long _maxFileSizeInBytes;

        public MaxFileSizeAttribute(long maxFileSizeInBytes)
            =>_maxFileSizeInBytes = maxFileSizeInBytes;

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var files = value switch
            {
                IFormFile singleFile => new[] { singleFile },
                IEnumerable<IFormFile> filesCollection => filesCollection,
                _ => null
            };

            if (files == null) return ValidationResult.Success;

            foreach (var file in files)
                if (file.Length > _maxFileSizeInBytes)
                    return new ValidationResult(
                        $"Файл `{file.FileName}` превышает лимит в {_maxFileSizeInBytes / 1024 / 1024} MB");
            
            return ValidationResult.Success;
        }
    }
}