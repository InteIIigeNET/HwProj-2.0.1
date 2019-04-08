namespace HwProj.CoursesService.API.Models.ViewModels
{
    public class CourseStudentViewModel
    {
        public long StudentId { get; set; }
        public bool IsAccepted { get; set; }

        public CourseStudentViewModel(CourseStudent courseStudent)
        {
            StudentId = courseStudent.StudentId;
            IsAccepted = courseStudent.IsAccepted;
        }
    }
}
