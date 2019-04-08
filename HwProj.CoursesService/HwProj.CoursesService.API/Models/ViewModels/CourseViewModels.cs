using AutoMapper;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace HwProj.CoursesService.API.Models.ViewModels
{
    public class CreateCourseViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Name { get; set; }

        [Required]
        public string GroupName { get; set; }

        [Required]
        public bool IsOpen { get; set; }
    }

    public class UpdateCourseViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Name { get; set; }

        [Required]
        public string GroupName { get; set; }

        [Required]
        public bool IsOpen { get; set; }

        public bool IsComplete { get; set; }
    }

    public class CourseViewModel
    {
        public long Id { get; set; }
        
        public string Name { get; set; }
        
        public string GroupName { get; set; }
        
        public bool IsOpen { get; set; }
        
        public bool IsComplete { get; set; }
        
        public string MentorId { get; set; }

        public List<CourseStudentViewModel> CourseStudents { get; set; } = new List<CourseStudentViewModel>();
    }
}
