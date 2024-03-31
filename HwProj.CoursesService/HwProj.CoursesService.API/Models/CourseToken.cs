using HwProj.Repositories;
using System;
using System.ComponentModel.DataAnnotations;

namespace HwProj.CoursesService.API.Models
{
    public class CourseToken : IEntity<long>
    {
        [Key]
        public long Id { get; set; }

        [Required]
        public string Token { get; set; }

        [Required]
        public DateTime Expires { get; set; }
    }
}
