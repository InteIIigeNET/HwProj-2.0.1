namespace HwProj.ContentService.API.Models;

public record Scope(
    long CourseId,
    CourseUnitType CourseUnitType,
    long CourseUnitId
);