using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models
{
    public class Homework
    {
        public long Id { get; set; }
        public string Name { get; set; }

        public long CourseId { get; set; }
        public Course Course { get; set; }

        public List<HomeworkApplication> Applications { get; set; } = new List<HomeworkApplication>();
    }
}
