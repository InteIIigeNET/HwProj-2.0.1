using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class CourseStudent : IEntity
    {
        [Key]
        public long Id { get; set; }
        
        public long CourseId { get; set; }
        public Course Course { get; set; }

        public long StudentId { get; set; }
        public Student Student { get; set; }

        public bool IsAccepted { get; set; }

        public CourseStudent()
        {
        }

        public CourseStudent(Course course, Student student)
        {
            CourseId = course.Id;
            Course = course;
            StudentId = student.Id;
            Student = student;
            IsAccepted = course.IsOpen;
        }
    }
}
