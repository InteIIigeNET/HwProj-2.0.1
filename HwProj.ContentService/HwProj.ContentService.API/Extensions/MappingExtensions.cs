using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Database;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.ContentService.Enums;

namespace HwProj.ContentService.API.Extensions;

public static class MappingExtensions
{
    public static Scope ToScope(this FileToCourseUnit fileToCourseUnit)
        => new Scope(
            CourseId: fileToCourseUnit.CourseId,
            CourseUnitId: fileToCourseUnit.CourseUnitId,
            CourseUnitType: fileToCourseUnit.CourseUnitType
        );

    public static Scope ToScope(this ScopeDTO scopeDTO)
        => new Scope(
            CourseId: scopeDTO.CourseId,
            CourseUnitType: Enum.Parse<CourseUnitType>(scopeDTO.CourseUnitType),
            CourseUnitId: scopeDTO.CourseUnitId
        );

    public static ScopeDTO ToScopeDTO(this Scope scope)
        => new ScopeDTO
        {
            CourseId = scope.CourseId,
            CourseUnitType = scope.CourseUnitType.ToString(),
            CourseUnitId = scope.CourseUnitId
        };

    public static KeyValuePair<Scope, Scope> ToKeyValuePair(this ScopeMappingPairDTO scopeMappingPairDTO)
        => KeyValuePair.Create(
            scopeMappingPairDTO.SourceScope.ToScope(),
            scopeMappingPairDTO.TargetScope.ToScope());

    public static CourseFilesTransfer ToCourseFilesTransfer(this CourseFilesTransferDTO filesTransferDTO)
        => new CourseFilesTransfer
        {
            SourceCourseId = filesTransferDTO.SourceCourseId,
            ScopeMapping = filesTransferDTO.ScopeMapping.Select(ToKeyValuePair).ToDictionary()
        };
}
