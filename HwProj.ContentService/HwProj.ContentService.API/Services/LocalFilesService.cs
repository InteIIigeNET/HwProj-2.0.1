using System.Security.Cryptography;
using System.Text;
using HwProj.ContentService.API.Configuration;
using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Services.Interfaces;
using HwProj.Models.Result;
using Microsoft.Extensions.Options;

namespace HwProj.ContentService.API.Services;

public class LocalFilesService : ILocalFilesService
{
    private readonly string _storagePath;
    
    // Максимальная длина имени файла в Ubuntu (в байтах)
    private const int MaxFileNameBytes = 255;

    public LocalFilesService(IOptions<LocalStorageConfiguration> localStorageConfiguration)
    {
        _storagePath = localStorageConfiguration.Value.Path ??
                       throw new NullReferenceException("Не указан путь к локальному хранилищу файлов (для временного хранения)");
        Directory.CreateDirectory(_storagePath);
    }

    public async Task<string> SaveFile(IFormFile file, Scope fileScope)
    {
        var filePath = BuildFilePath(file.FileName, fileScope);
        var fullPath = Path.Combine(_storagePath, filePath);
        
        var directoryPath = Path.GetDirectoryName(fullPath);
        if (directoryPath is not null && !Directory.Exists(directoryPath))
            Directory.CreateDirectory(directoryPath);
    
        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);
        
        return fullPath;
    }

    public Result DeleteFile(string pathToFile)
    {
        var fullPath = Path.Combine(_storagePath, pathToFile);
        if (!File.Exists(fullPath))
        {
            return Result.Failed("Файл по пути {filePath} не найден", pathToFile);
        }

        File.Delete(fullPath);

        // Если папка файла теперь пуста, удаляем её
        var directoryPath = Path.GetDirectoryName(fullPath);
        if (directoryPath is not null && IsDirectoryEmpty(directoryPath))
            Directory.Delete(directoryPath);

        return Result.Success();
    }

    public Stream GetFileStream(string pathToFile)
    {
        var fullPath = Path.Combine(_storagePath, pathToFile);
        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException($"Файл по пути {pathToFile} не найден.");
        }

        return new FileStream(fullPath, FileMode.Open, FileAccess.Read);
    }

    private static string BuildFilePath(string fileName, Scope scope)
    {
        var escapedName = Uri.EscapeDataString(fileName);
        if (Encoding.UTF8.GetByteCount(escapedName) > MaxFileNameBytes)
            escapedName = HashFileName(fileName);
        return $"courses/{scope.CourseId}/{scope.CourseUnitType}s/{scope.CourseUnitId}/{escapedName}";
    }

    private bool IsDirectoryEmpty(string path)
        => Directory.GetFiles(path).Length == 0 && Directory.GetDirectories(path).Length == 0;

    // TODO: предусмотреть возможность аналогичных преобразований при сохранении в S3, хоть там допустимая длина и больше
    private static string HashFileName(string longFileName)
    {
        using var sha256 = SHA256.Create();
        
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(longFileName));
        var hash = BitConverter.ToString(hashedBytes).Replace('/', '_').Substring(0, 30);

        var extension = Path.GetExtension(longFileName);
        return $"{hash}{extension}";
    }
}