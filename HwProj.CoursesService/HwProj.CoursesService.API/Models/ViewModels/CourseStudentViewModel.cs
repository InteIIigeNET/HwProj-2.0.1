namespace HwProj.CoursesService.API.Models.ViewModels
{
    public class CourseStudentViewModel
    {
        public string Id { get; set; }
        public bool IsAccepted { get; set; }

        public CourseStudentViewModel(CourseStudent courseStudent)
        {
            Id = courseStudent.StudentId;
            IsAccepted = courseStudent.IsAccepted;
        }
    }
}
