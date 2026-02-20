using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Database;
using HwProj.ContentService.API.Models.Enums;
using HwProj.Models.ContentService.DTO;

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
}
