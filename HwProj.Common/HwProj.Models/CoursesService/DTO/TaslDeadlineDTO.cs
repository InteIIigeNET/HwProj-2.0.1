using System;
using System.Collections.Generic;

namespace HwProj.Models.CoursesService.DTO
{
    public class TaskDeadlineDto
    {
        public long TaskId { get; set; }
        public string TaskTitle { get; set; }
        public string CourseTitle { get; set; }
        public long MaxRating { get; set; }
        public DateTime PublicationDate { get; set; }
        public List<DeadlineDto> Deadlines { get; set; } = new();
    }
    
    public class DeadlineDto
    {
        public int ToSubtract { get; set; }
        
        public bool IsStrict { get; set; }

        public List<string> AffectedStudentsId { get; set; } = new();
        
        public DateTime DateTime { get; set; }
    }
}
