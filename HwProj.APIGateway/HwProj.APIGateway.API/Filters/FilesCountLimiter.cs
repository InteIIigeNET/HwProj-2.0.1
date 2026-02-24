using System.Linq;
using System.Threading.Tasks;
using HwProj.ContentService.Client;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.CourseUnitType;

namespace HwProj.APIGateway.API.Filters;

public class FilesCountLimiter(IContentServiceClient contentServiceClient)
{
    public const long MaxSolutionFiles = 5;

    public async Task<bool> CheckCountLimit(ProcessFilesDTO processFilesDto)
    {
        if (processFilesDto.FilesScope.CourseUnitType == CourseUnitType.Homework) return true;

        var existingStatuses = await contentServiceClient.GetFilesStatuses(processFilesDto.FilesScope);
        if (!existingStatuses.Succeeded) return false;

        var existingIds = existingStatuses.Value.Select(f => f.Id).ToList();
        if (processFilesDto.DeletingFileIds.Any(id => !existingIds.Contains(id)))
            return false;

        return existingIds.Count + processFilesDto.NewFiles.Count - processFilesDto.DeletingFileIds.Count <=
               MaxSolutionFiles;
    }
}
