using HwProj.Models.ContentService.Enums;

namespace HwProj.ContentService.API.Models;

public record Scope(
    long CourseId,
    CourseUnitType CourseUnitType,
    long CourseUnitId
);