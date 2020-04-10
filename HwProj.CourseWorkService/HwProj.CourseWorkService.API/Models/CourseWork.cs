using HwProj.Repositories;
using System;
using System.Collections.Generic;

namespace HwProj.CourseWorkService.API.Models
{
    public class CourseWork : IEntity<long>
    {
        public long Id { get; set; }
        
        public string Title { get; set; }
        public string Overview { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Requirements { get; set; }
        public DateTime CreationTime { get; set; }

        public string ConsultantName { get; set; }
        public string ConsultantContact { get; set; }
        public string SupervisorName { get; set; }
        public string SupervisorContact { get; set; }

        public string StudentId { get; set; }
        public string ReviewerId { get; set; }
        public string LecturerId { get; set; }
        public string CuratorId { get; set; }


        public bool IsCompleted { get; set; }

        public List<Application> Applications { get; set; }
        public List<Deadline> Deadlines { get; set; }
        //public ICollection<WorkFile> WorkFiles { get; set; }
        //public ICollection<Bid> Bids { get; set; }

        public CourseWork()
        {
            Applications = new List<Application>();
            Deadlines = new List<Deadline>();
            //WorkFiles = new List<WorkFile>();
            //Bids = new List<Bid>();
        }
    }
}
