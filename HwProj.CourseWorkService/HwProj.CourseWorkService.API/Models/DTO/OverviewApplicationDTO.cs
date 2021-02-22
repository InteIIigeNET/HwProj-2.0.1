using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Models.DTO
{
    public class OverviewApplicationDTO
    {
        public long Id { get; set; }

        public long CourseWorkId { get; set; }
        public string CourseWorkTitle { get; set; }

        public string Date { get; set; }
    }
}
