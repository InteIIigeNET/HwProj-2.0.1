using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class CourseDescription : IEntity<long>
    {
        [Key]
        public long Id { get; set; }

        public string Description { get; set; }

        public long CourseId { get; set; }
    }
}
