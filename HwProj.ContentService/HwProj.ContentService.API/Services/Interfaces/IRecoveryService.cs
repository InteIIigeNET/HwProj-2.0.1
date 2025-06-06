namespace HwProj.ContentService.API.Services.Interfaces;

public interface IRecoveryService
{
    public Task TransferFiles(string oldBucketName, string oldFilesPathRegex);
    public Task ReProcessPendingFiles();
}