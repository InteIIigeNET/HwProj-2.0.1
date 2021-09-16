using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class CreateHomeworkViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Title { get; set; }
        
        public string Description { get; set; }

        public List<CreateTaskViewModel> Tasks { get; set; } = new List<CreateTaskViewModel>();
    }

    public class HomeworkViewModel
    {
        public long Id { get; set; }
        
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        public DateTime Date { get; set; }
        
        public long CourseId { get; set; }

        public List<HomeworkTaskViewModel> Tasks { get; set; } = new List<HomeworkTaskViewModel>();
    }
}
