using System;

namespace HwProj.Models.CoursesService.DTO
{
    public class TaskDeadlineDto
    {
        public long TaskId { get; set; }
        public string TaskTitle { get; set; }
        public string CourseTitle { get; set; }
        public DateTime PublicationDate { get; set; }
        public DateTime DeadlineDate { get; set; }
    }
}
