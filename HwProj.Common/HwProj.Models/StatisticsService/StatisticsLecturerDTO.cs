using HwProj.Models.SolutionsService;
using System;
using System.Collections.Generic;
using System.Text;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsLecturerDTO
    {
        public string LecturerId { get; set; }
        public int NumberOfCheckedSolutions { get; set; }
        public int NumberOfCheckedUniqueSolutions { get; set; }
    }
}
