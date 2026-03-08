using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace HwProj.Models.ContentService.Attributes
{
    public abstract class FileValidationAttribute : ValidationAttribute
    {
        protected abstract ValidationResult Validate(IFormFile file);

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext) =>
            value switch
            {
                IFormFile singleFile => Validate(singleFile),
                IEnumerable<IFormFile> files => files
                    .Select(Validate)
                    .FirstOrDefault(x => x != ValidationResult.Success) ?? ValidationResult.Success,
                _ => null
            };
    }
}
