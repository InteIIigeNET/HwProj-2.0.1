using HwProj.Repositories;
using System;
using System.ComponentModel.DataAnnotations;

namespace HwProj.CourseWorkService.API.Models
{
    public class Application : IEntity<long>
    {
        public long Id { get; set; }

        public string Message { get; set; }
        public DateTime Date { get; set; }

        [Required]
        public string StudentProfileId { get; set; }
        public StudentProfile StudentProfile { get; set; }

        [Required]
        public long CourseWorkId { get; set; }
        public CourseWork CourseWork { get; set; }
    }
}
