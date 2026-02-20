using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Microsoft.AspNetCore.Http;
using FileTypeChecker.Abstracts;
using FileTypeChecker.Types;

namespace HwProj.Models.ContentService.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class CorrectFileTypeAttribute : FileValidationAttribute
    {
        private static readonly HashSet<FileType> ForbiddenFileTypes = new HashSet<FileType>
        {
            new MachO(), new Executable(), new ExecutableAndLinkableFormat()
        };

        protected override ValidationResult Validate(IFormFile file)
        {
            try
            {
                using var fileContent = file.OpenReadStream();
                //FileTypeValidator.RegisterCustomTypes(typeof(MachO).Assembly);
                if ( //!FileTypeValidator.IsTypeRecognizable(fileContent) ||
                    ForbiddenFileTypes.Any(type => type.DoesMatchWith(fileContent)))
                {
                    return new ValidationResult(
                        $"Файл `{file.FileName}` имеет недопустимый тип ${file.ContentType}");
                }
            }
            catch
            {
                return new ValidationResult(
                    $"Невозможно прочитать файл `{file.FileName}`");
            }

            return ValidationResult.Success;
        }

        private class MachO : FileType
        {
            private const string TypeName = "MacOS executable";
            private const string TypeExtension = "macho";

            private static readonly byte[][] MagicBytes =
            {
                new byte[] { 0xfe, 0xed, 0xfa, 0xce }, // Mach-O BE 32-bit
                new byte[] { 0xfe, 0xed, 0xfa, 0xcf }, // Mach-O BE 64-bit
                new byte[] { 0xce, 0xfa, 0xed, 0xfe }, // Mach-O LE 32-bit
                new byte[] { 0xcf, 0xfa, 0xed, 0xfe }, // Mach-O LE 64-bit
            };

            public MachO() : base(TypeName, TypeExtension, MagicBytes)
            {
            }
        }
    }
}
