using System;

namespace HwProj.CourseWorkService.API.Models.DTO
{
    public class DetailCourseWork
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Requirements { get; set; }
        public DateTime CreationTime { get; set; }

        public string ConsultantName { get; set; }
        public string ConsultantContact { get; set; }
        public string SupervisorName { get; set; }
        public string SupervisorContact { get; set; }

        public string StudentName { get; set; }
        public string ReviewerName { get; set; }

        public WorkFile[] WorkFiles { get; set; }
        public Deadline[] Deadlines { get; set; }
    }
}
