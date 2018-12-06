using AutoMapper;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

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

        public List<CourseStudentViewModel> Students { get; set; } = new List<CourseStudentViewModel>();

        public static CourseViewModel FromCourse(Course course, IMapper mapper)
        {
            var courseViewModel = mapper.Map<CourseViewModel>(course);
            courseViewModel.Students = course.CourseStudents.Select(cs => new CourseStudentViewModel(cs)).ToList();

            return courseViewModel;
        }
    }
}
