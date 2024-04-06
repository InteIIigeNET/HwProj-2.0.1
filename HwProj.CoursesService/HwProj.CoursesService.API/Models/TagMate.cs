using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class TagMate : IEntity<long>
    {
        [Key]
        public long Id { get; set; }
        
        public long HomeworkId { get; set; }
        
        public long TagId { get; set; }
    }
}