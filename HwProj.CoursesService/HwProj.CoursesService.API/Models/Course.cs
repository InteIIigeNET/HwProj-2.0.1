using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class Course : IEntity<long>
    {
        [Key]
        public long Id { get; set; }
        
        public string Name { get; set; }
        
        public string GroupName { get; set; }
        
        public bool IsOpen { get; set; }
        
        public bool IsComplete { get; set; }
        
        public string MentorId { get; set; }

        public List<CourseMate> CourseMates { get; set; } = new List<CourseMate>();
    }
}
