using System;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class AddDeadlineViewModel
    {
        public int ToSubtract { get; set; }

        public DateTime DateTime { get; set; }

        public string  AffectedStudentId { get; set; }
    }
    
    public class DeadlineViewModel
    {
        public long Id { get; set; }
        
        public long TaskId { get; set; } 

        public int ToSubtract { get; set; }
        
        public DateTime DateTime { get; set; }
        
        public string  AffectedStudentId { get; set; }
    }
}
