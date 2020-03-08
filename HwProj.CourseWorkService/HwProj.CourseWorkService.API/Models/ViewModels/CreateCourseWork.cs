namespace HwProj.CourseWorkService.API.Models.ViewModels
{
    public class CreateCourseWork
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Requirements { get; set; }

        public string ConsultantName { get; set; }
        public string ConsultantContact { get; set; }
        public string SupervisorName { get; set; }
        public string SupervisorContact { get; set; }
    }
}
