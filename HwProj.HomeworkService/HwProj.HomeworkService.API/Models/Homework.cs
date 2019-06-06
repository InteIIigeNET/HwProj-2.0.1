using System;
using HwProj.Repositories;

namespace HwProj.HomeworkService.API.Models
{
    public class Homework : IEntity
    {
        public long Id { get; set; }
        
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        public DateTime Date { get; set; }
        
        public long CourseId { get; set; }
        
        public HomeworkTask[] Tasks { get; set; }
    }
}