using HwProj.ContentService.API.Models;
using HwProj.Models.Result;

namespace HwProj.ContentService.API.Services.Interfaces;

public interface ILocalFilesService
{
    public Task SaveFile(Stream file, string filePath);
    public Result DeleteFile(string pathToFile);
    public Stream GetFileStream(string pathToFile);
}