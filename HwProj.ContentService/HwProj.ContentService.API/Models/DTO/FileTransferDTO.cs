using HwProj.Models.ContentService.Enums;

namespace HwProj.ContentService.API.Models.DTO;

public record FileTransferDTO(
    string Name,
    long SizeInBytes,
    string ContentType,
    Stream FileStream,
    CourseUnitType CourseUnitType,
    long CourseUnitId,
    long CourseId
);