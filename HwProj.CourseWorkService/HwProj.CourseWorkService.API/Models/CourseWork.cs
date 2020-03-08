using HwProj.Repositories;
using System;
using System.Collections.Generic;

namespace HwProj.CourseWorkService.API.Models
{
    public class CourseWork : IEntity
    {
        public long Id { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Requirements { get; set; }
        public DateTime CreationTime { get; set; }

        public string ConsultantName { get; set; }
        public string ConsultantContact { get; set; }
        public string SupervisorName { get; set; }
        public string SupervisorContact { get; set; }

        public long? StudentId { get; set; }
        public long? ReviewerId { get; set; }
        public long LecturerId { get; set; }

        public ICollection<Application> Applications { get; set; }
        public ICollection<Deadline> Deadlines { get; set; }
        public ICollection<WorkFile> WorkFiles { get; set; }

        public CourseWork()
        {
            Applications = new List<Application>();
            Deadlines = new List<Deadline>();
            WorkFiles = new List<WorkFile>();
        }
    }
}
