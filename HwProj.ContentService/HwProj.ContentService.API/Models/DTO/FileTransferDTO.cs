using HwProj.ContentService.API.Models.Enums;

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