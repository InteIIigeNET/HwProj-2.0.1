using System;
using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class Homework : IEntity<long>
    {
        public long Id { get; set; }
        
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        public DateTime Date { get; set; }
        
        public long CourseId { get; set; }
        
        public List<HomeworkTask> Tasks { get; set; }
    }
}
