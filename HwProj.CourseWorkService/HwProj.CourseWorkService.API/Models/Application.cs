using HwProj.Repositories;
using System;
using System.ComponentModel.DataAnnotations;
using HwProj.CourseWorkService.API.Models.UserInfo;

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
