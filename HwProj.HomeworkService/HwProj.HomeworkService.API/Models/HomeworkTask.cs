using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models
{
    public class HomeworkTask
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        public long HomeworkId { get; set; }
        public Homework Homework { get; set; }
    }
}
