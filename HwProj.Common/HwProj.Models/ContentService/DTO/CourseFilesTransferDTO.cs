using System.Collections.Generic;

namespace HwProj.Models.ContentService.DTO
{
    public class CourseFilesTransferDto
    {
        public long SourceCourseId { get; set; }
        public long TargetCourseId { get; set; }
        public List<ScopeMappingDto> HomeworksMapping { get; set; } = new List<ScopeMappingDto>();
    }
}
