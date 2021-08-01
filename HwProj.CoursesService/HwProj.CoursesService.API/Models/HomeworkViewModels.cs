using System;
using System.Collections.Generic;

namespace HwProj.CoursesService.API.Models
{
    public class CreateHomeworkViewModel
    {
        public string Title { get; set; }
        
        public string Description { get; set; }
    }

    public class HomeworkViewModel
    {
        public long Id { get; set; }
        
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        public DateTime Date { get; set; }
        
        public long CourseId { get; set; }
        
        public List<HomeworkTaskViewModel> Tasks { get; set; }
    }
}
