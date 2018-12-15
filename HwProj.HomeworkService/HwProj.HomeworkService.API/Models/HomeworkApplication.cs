using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models
{
    public class HomeworkApplication
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string Link { get; set; }

        public long HomeworkId { get; set; }
        public Homework Homework { get; set; }
    }
}
