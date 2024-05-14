using System.Collections.Generic;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class CreateCourseFilterViewModel
    {
        public string UserId { get; set; }
        
        public long CourseId { get; set; }
        
        public List<string> StudentIds { get; set; } = new List<string>();
        
        public List<long> HomeworkIds { get; set; } = new List<long>();
        
        public List<string> MentorIds { get; set; } = new List<string>();
    }
}