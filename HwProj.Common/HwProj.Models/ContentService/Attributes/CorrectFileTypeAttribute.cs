using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using FileTypeChecker;
using Microsoft.AspNetCore.Http;
using FileTypeChecker.Abstracts;
using FileTypeChecker.Types;

namespace HwProj.Models.ContentService.Attributes
{

    public class MachO : FileType
    {
        public const string TypeName = "MacOS executable";
        public const string TypeExtension = "macho";
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
    
    [AttributeUsage(AttributeTargets.Property)]
    public class CorrectFileTypeAttribute : ValidationAttribute
    {
        private static readonly HashSet<FileType> forbiddenFileTypes = new HashSet<FileType>{
            new MachO(), new Executable(), new ExecutableAndLinkableFormat()
        };

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var files = value switch
            {
                IFormFile singleFile => new[] { singleFile },
                IEnumerable<IFormFile> filesCollection => filesCollection,
                _ => null
            };

            if (files == null) return ValidationResult.Success;

            FileTypeValidator.RegisterCustomTypes(typeof(MachO).Assembly);
            foreach (var file in files)
            {
                try
                {
                    using (var fileContent = file.OpenReadStream())
                    {
                        if (!FileTypeValidator.IsTypeRecognizable(fileContent) ||
                            forbiddenFileTypes.Any(type => type.DoesMatchWith(fileContent)))
                        {
                            return new ValidationResult(
                                $"Файл `{file.FileName}` имеет недопустимый тип ${file.ContentType}");
                        }
                    }
                }
                catch
                {
                    return new ValidationResult(
                        $"Невозможно прочитать файл `{file.FileName}`");
                }
            }

            return ValidationResult.Success;
        }
    }
}