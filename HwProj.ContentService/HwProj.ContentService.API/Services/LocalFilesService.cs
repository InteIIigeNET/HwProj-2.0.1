using HwProj.ContentService.API.Configuration;
using HwProj.ContentService.API.Services.Interfaces;
using HwProj.Models.Result;
using Microsoft.Extensions.Options;

namespace HwProj.ContentService.API.Services;

public class LocalFilesService : ILocalFilesService
{
    private readonly string _storagePath;
    
    public LocalFilesService(IOptions<LocalStorageConfiguration> localStorageConfiguration)
    {
        _storagePath = localStorageConfiguration.Value.Path ??
                       throw new NullReferenceException("Не указан путь к локальному хранилищу файлов (для временного хранения)");
        Directory.CreateDirectory(_storagePath);
    }

    public async Task SaveFile(Stream fileStream, string filePath)
    {
        var fullPath = Path.Combine(_storagePath, filePath);
        
        var directoryPath = Path.GetDirectoryName(fullPath);
        if (directoryPath is not null && !Directory.Exists(directoryPath))
            Directory.CreateDirectory(directoryPath);
    
        await using var stream = new FileStream(fullPath, FileMode.Create);
        await fileStream.CopyToAsync(stream);
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
    
    private bool IsDirectoryEmpty(string path)
        => Directory.GetFiles(path).Length == 0 && Directory.GetDirectories(path).Length == 0;
}