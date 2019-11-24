using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Models.CourseWorkViewModels
{
    public class CourseWorkDetailsModel
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Publicity { get; set; }
        public string Requirements { get; set; }
        public string SupervisorId { get; set; }
        public DateTime CreationTime { get; set; }

        public string Consultant { get; set; }
        public string SupervisorContact { get; set; }
        public string ConsultantContact { get; set; }

        public int ApplicationsCount { get; set; }
    }
}
