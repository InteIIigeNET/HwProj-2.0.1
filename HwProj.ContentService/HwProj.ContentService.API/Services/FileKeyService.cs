using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Cyrillic.Convert;
using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Services.Interfaces;

namespace HwProj.ContentService.API.Services;

public class FileKeyService : IFileKeyService
{
    // Максимальная длина имени файла в Ubuntu (в байтах)
    private const int MaxFileNameOnServerBytes = 255;

    public string BuildS3FileKey(Scope scope, string fileName, long fileRecordId)
    {
        var pureName = SanitizeFileName(fileName);
        return $"courses/{scope.CourseId}/{scope.CourseUnitType}s/{scope.CourseUnitId}/{fileRecordId}_{pureName}";
    }

    public string BuildServerFilePath(Scope scope, string fileName)
    {
        var pureName = SanitizeFileName(fileName);
        if (Encoding.UTF8.GetByteCount(pureName) > MaxFileNameOnServerBytes)
            pureName = HashFileName(fileName);
        return $"courses/{scope.CourseId}/{scope.CourseUnitType}s/{scope.CourseUnitId}/{pureName}";
    }
    
    private static string SanitizeFileName(string fileName)
    {
        // Выполняем транслитерацию
        var transliteratedName = fileName.ToRussianLatin();

        // Заменяем пробелы на символы подчеркивания
        transliteratedName = transliteratedName.Replace(' ', '_');

        // Заменяем другие нежелательные символы
        // В данном случае заменяем все, кроме букв, цифр, дефисов и подчеркиваний
        transliteratedName = Regex.Replace(transliteratedName, @"[^\w\-\.]", "");

        return transliteratedName;
    }
    
    private static string HashFileName(string longFileName)
    {
        using var sha256 = SHA256.Create();
        
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(longFileName));
        var hash = BitConverter.ToString(hashedBytes).Replace('/', '_').Substring(0, 30);

        var extension = Path.GetExtension(longFileName);
        return $"{hash}{extension}";
    }
}