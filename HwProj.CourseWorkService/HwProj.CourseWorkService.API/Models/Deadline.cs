using HwProj.Repositories;
using System;
namespace HwProj.CourseWorkService.API.Models
{
    public class Deadline : IEntity<long>
    {
        public long Id { get; set; }

        public string Type { get; set; }
        public DateTime Date { get; set; }

        public long CourseWorkId { get; set; }
        public CourseWork CourseWork { get; set; }
    }
}
