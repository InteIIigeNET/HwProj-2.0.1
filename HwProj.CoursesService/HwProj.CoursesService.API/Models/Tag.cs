using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class Tag : IEntity<long>
    {
        [Key]
        public long Id { get; set; }
        
        public string Title { get; set; }
        
        public string Description { get; set; }
    }
}