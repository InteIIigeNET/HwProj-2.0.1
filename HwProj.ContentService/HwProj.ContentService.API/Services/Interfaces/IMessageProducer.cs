using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Messages;

namespace HwProj.ContentService.API.Services.Interfaces;

public interface IMessageProducer
{
    public Task PushUploadFilesMessages(Scope scope, List<IFormFile> files, string userId);
    public Task PushUpdateFileStatusMessage(UpdateStatusMessage updateStatusMessage);
    public Task PushFileDeletedMessage(FileDeletedMessage fileDeletedMessage);
    public Task PushDeleteFilesMessages(Scope scope, List<long> fileIds, string userId);
}