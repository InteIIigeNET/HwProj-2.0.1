using System.Linq;
using System.Threading.Tasks;
using HwProj.ContentService.Client;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Result;

namespace HwProj.APIGateway.API.Filters;

public class FilesCountLimit
{
    private readonly IContentServiceClient _contentServiceClient;
    public readonly long maxSolutionFiles = 5;

    public FilesCountLimit(IContentServiceClient contentServiceClient)
    {
        _contentServiceClient = contentServiceClient;
    }

    public async Task<bool> CheckCountLimit(ProcessFilesDTO processFilesDto)
    {
        if(processFilesDto.FilesScope.CourseUnitType == "Homework") return true;

        var existingStatuses = await _contentServiceClient.GetFilesStatuses(processFilesDto.FilesScope);
        if(!existingStatuses.Succeeded) return false;

        var existingIds = existingStatuses.Value.Select(f => f.Id);
        if (processFilesDto.DeletingFileIds.Any(id => !existingIds.Contains(id)))
        {
            return false;
        }

        if (existingIds.Count() + processFilesDto.NewFiles.Count - processFilesDto.DeletingFileIds.Count > maxSolutionFiles)
        {
            return false;
        }

        return true;
    }
}