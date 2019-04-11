using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class CourseMate : IEntity
    {
        [Key]
        public long Id { get; set; }
        
        public long CourseId { get; set; }
        
        public long StudentId { get; set; }
        
        public bool IsAccepted { get; set; }
    }
}
