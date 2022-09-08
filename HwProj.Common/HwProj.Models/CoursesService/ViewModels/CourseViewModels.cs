using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HwProj.Models.AuthService.DTO;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class CreateCourseViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Name { get; set; }

        public string GroupName { get; set; }

        [Required] public bool IsOpen { get; set; }
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

    public class CourseDTO
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string GroupName { get; set; }
        public bool IsOpen { get; set; }
        public bool IsCompleted { get; set; }

        // TODO: исправить
        public string[] MentorIds { get; set; }
        public string InviteCode { get; set; }
        public CourseMateViewModel[] CourseMates { get; set; }
        public HomeworkViewModel[] Homeworks { get; set; }
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
    }
}
