namespace HwProj.CoursesService.API.Models
{
    public class CourseStudent
    {
        public long CourseId { get; set; }
        public Course Course { get; set; }

        public string StudentId { get; set; }
        public User Student { get; set; }

        public bool IsAccepted { get; set; }

        public CourseStudent()
        {
        }

        public CourseStudent(Course course, User student)
        {
            CourseId = course.Id;
            Course = course;
            StudentId = student.Id;
            Student = student;
            IsAccepted = course.IsOpen;
        }

        public override bool Equals(object obj)
        {
            if (!(obj is CourseStudent other))
            {
                return false;
            }

            return StudentId == other.StudentId && CourseId == other.CourseId && IsAccepted == other.IsAccepted;
        }
    }
}
