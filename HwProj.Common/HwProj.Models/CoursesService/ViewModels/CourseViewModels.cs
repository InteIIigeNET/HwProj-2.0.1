using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using HwProj.Models.AuthService.DTO;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class CreateCourseViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Name { get; set; }

        public string GroupName { get; set; }
        
        public List<string> StudentIDs { get; set; }  = new List<string>();
        public bool FetchStudents { get; set; } 
        [Required] public bool IsOpen { get; set; }

        public long? BaseCourseId { get; set; }
    }

    public class UpdateCourseViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Name { get; set; }

        public string GroupName { get; set; }

        [Required] public bool IsOpen { get; set; }

        public bool IsCompleted { get; set; }
    }

    public class CourseDTO : CoursePreview
    {
        public bool IsOpen { get; set; }
        public string InviteCode { get; set; }
        public CourseMateViewModel[] CourseMates { get; set; }
        public HomeworkViewModel[] Homeworks { get; set; }
        public GroupViewModel[] Groups { get; set; } = Array.Empty<GroupViewModel>();
        public IEnumerable<CourseMateViewModel> AcceptedStudents => CourseMates.Where(t => t.IsAccepted);
        public IEnumerable<CourseMateViewModel> NewStudents => CourseMates.Where(t => !t.IsAccepted);
    }

    public class CourseViewModel
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string GroupName { get; set; }
        public bool IsOpen { get; set; }
        public bool IsCompleted { get; set; }

        public AccountDataDto[] Mentors { get; set; }
        public AccountDataDto[] AcceptedStudents { get; set; }
        public AccountDataDto[] NewStudents { get; set; }
        public HomeworkViewModel[] Homeworks { get; set; }
    }

    // Модель для списка всех курсов
    public class CoursePreview
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string GroupName { get; set; }
        public bool IsCompleted { get; set; }
        public string[] MentorIds { get; set; }
        public long? TaskId { get; set; }
    }
}