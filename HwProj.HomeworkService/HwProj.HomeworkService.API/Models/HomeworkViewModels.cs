using System;
using System.Collections.Generic;

namespace HwProj.HomeworkService.API.Models
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
        
        public string Date { get; set; }
        
        public long CourseId { get; set; }
        
        public List<long> Tasks { get; set; }
    }
}