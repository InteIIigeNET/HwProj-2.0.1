using HwProj.Repositories;
using System;

namespace HwProj.CourseWorkService.API.Models
{
    public class Application : IEntity
    {
        public long Id { get; set; }

        public string Message { get; set; }
        public DateTime Date { get; set; }

        public string StudentId { get; set; }
        public Student Student { get; set; }

        public long CourseWorkId { get; set; }
        public CourseWork CourseWork { get; set; }
    }
}
