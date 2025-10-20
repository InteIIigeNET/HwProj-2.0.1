using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace HwProj.Models.ContentService.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class CorrectFileTypeAttribute : ValidationAttribute
    {
        private static HashSet<byte[]> forbiddenFileSignatures = new HashSet<byte[]>{
            
            new byte[] { 0x4d, 0x5a }, // MZ (exe BE)
            new byte[] { 0x5a, 0x4d }, // ZM (exe LE)
            
            new byte[] { 0x7F, 0x45, 0x4C, 0x46 }, // ELF
            
            new byte[] { 0xfe, 0xed, 0xfa, 0xce }, // Mach-O BE 32-bit
            new byte[] { 0xfe, 0xed, 0xfa, 0xcf }, // Mach-O BE 64-bit
            new byte[] { 0xce, 0xfa, 0xed, 0xfe }, // Mach-O LE 32-bit
            new byte[] { 0xcf, 0xfa, 0xed, 0xfe }, // Mach-O LE 64-bit
            
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

            foreach (var file in files)
            {
                try
                {
                    // Первые байты для проверки сигнатуры
                    var buffer = new byte[4];
                    var bytesRead = file.OpenReadStream().Read(buffer, 0, buffer.Length);

                    if (bytesRead < 2)
                        return ValidationResult.Success; // Слишком короткий файл, не исполняемый

                    foreach (var signature in forbiddenFileSignatures)
                    {
                        if (signature.SequenceEqual(buffer.Take(signature.Length)))
                        {
                            return new ValidationResult(
                                $"Файл `{file.FileName}` имеет недопустимый тип ${file.ContentType}");
                        }
                    }
                }
                catch
                {
                    return new ValidationResult(
                        $"Невозможно открыть файл `{file.FileName}`");
                }
            }

            return ValidationResult.Success;
        }
    }
}