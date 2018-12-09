namespace HwProj.CoursesService.API.Models.ViewModels
{
    public class CourseStudentViewModel
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public bool IsAccepted { get; set; }

        public CourseStudentViewModel(CourseStudent courseStudent)
        {
            Id = courseStudent.StudentId;
            Name = courseStudent.Student.Name;
            IsAccepted = courseStudent.IsAccepted;
        }
    }
}
