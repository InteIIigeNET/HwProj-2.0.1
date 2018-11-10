using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models
{
    public class CourseStudent
    {
        public long CourseId { get; set; }
        public Course Course { get; set; }

        public long StudentId { get; set; }
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
    }
}
