using HwProj.ContentService.API.Models;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.ContentService.Enums;

namespace HwProj.ContentService.API.Extensions;

public static class MappingExtensions
{
    public static Scope ToScope(this ScopeDTO scopeDTO)
        => new Scope(
            CourseId: scopeDTO.CourseId,
            CourseUnitType: Enum.Parse<CourseUnitType>(scopeDTO.CourseUnitType),
            CourseUnitId: scopeDTO.CourseUnitId
        );

    public static ScopeDTO ToScopeDTO(this Scope scope)
        => new ScopeDTO()
        {
            CourseId = scope.CourseId,
            CourseUnitType = scope.CourseUnitType.ToString(),
            CourseUnitId = scope.CourseUnitId
        };

    public static ScopeMappingPair ToScopeMappingPair(this ScopeMappingPairDTO scopeMappingPair)
        => new ScopeMappingPair()
        {
            SourceScope = scopeMappingPair.SourceScope.ToScope(),
            TargetScope = scopeMappingPair.TargetScope.ToScope()
        };

    public static TransferFiles ToTransferFiles(this TransferFilesDTO transferFilesDTO)
        => new TransferFiles()
        {
            ScopeMapping = transferFilesDTO.ScopeMapping.Select(pair => pair.ToScopeMappingPair()).ToList()
        };
}
