using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Models.CourseWorkViewModels
{
    public class CourseWorkOverviewModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Supervisor { get; set; }
        public string Requirements { get; set; }
    }
}
