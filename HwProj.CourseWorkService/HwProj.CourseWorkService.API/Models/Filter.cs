using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Models
{
    public class Filter
    {
        public bool? IsAvailable { get; set; } = null;
        public string SupervisorId { get; set; }
        public string StudentId { get; set; }
        public string ReviewerId { get; set; }
    }
}
