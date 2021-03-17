namespace HwProj.CourseWorkService.API.Models.DTO
{
    public class DetailCourseWorkDTO
    {
        public long Id { get; set; }

        public string Title { get; set; }
        public string Overview { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Requirements { get; set; }
        public int Course { get; set; }
        public string CreationTime { get; set; }
        public bool IsCompleted { get; set; }
        public string Reference { get; set; }

        public string ConsultantName { get; set; }
        public string ConsultantContact { get; set; }
        public string SupervisorName { get; set; }
        public string SupervisorContact { get; set; }
        public string ReviewerName { get; set; }
        public string StudentName { get; set; }
        public int StudentCourse { get; set; }
    }
}
