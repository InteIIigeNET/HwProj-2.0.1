using HwProj.Repositories;
using System;

namespace HwProj.CourseWorkService.API.Models
{
    public class CourseWork : IEntity
    {
        public long Id { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Publicity { get; set; }
        public string Requirements { get; set; }
        public DateTime CreationTime { get; set; }
        public bool IsAvailable { get; set; }

        public string Consultant { get; set; }
        public string ConsultantContact { get; set; }
        public string SupervisorContact { get; set; }

        public string SupervisorId { get; set; }
        public string StudentId { get; set; }
        public string ReviewerId { get; set; }
    }
}
