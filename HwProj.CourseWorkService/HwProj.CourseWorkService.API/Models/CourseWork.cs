using HwProj.Repositories;
using System;
using System.Collections.Generic;
using HwProj.CourseWorkService.API.Models.UserInfo;

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
        public int Course { get; set; }
        public DateTime CreationTime { get; set; }

        public string ConsultantName { get; set; }
        public string ConsultantContact { get; set; }
        public string SupervisorName { get; set; }
        public string SupervisorContact { get; set; }

        public string StudentProfileId { get; set; }
        public StudentProfile StudentProfile { get; set; }

        public string ReviewerProfileId { get; set; }
        public ReviewerProfile ReviewerProfile { get; set; }

        public string LecturerProfileId { get; set; }
        public LecturerProfile LecturerProfile { get; set; }

        public string CuratorProfileId { get; set; }
        public CuratorProfile CuratorProfile { get; set; }


        public bool IsCompleted { get; set; }
        public bool CreatedByCurator { get; set; }
        public bool IsUpdated { get; set; }
        public string Reference { get; set; }

        public List<Application> Applications { get; set; }
        public List<Deadline> Deadlines { get; set; }
        public List<WorkFile> WorkFiles { get; set; }
        public List<Bid> Bids { get; set; }

        public CourseWork()
        {
            Applications = new List<Application>();
            Deadlines = new List<Deadline>();
            WorkFiles = new List<WorkFile>();
            Bids = new List<Bid>();
        }
    }
}
