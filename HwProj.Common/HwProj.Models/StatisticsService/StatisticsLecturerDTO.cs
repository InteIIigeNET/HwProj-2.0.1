using HwProj.Models.SolutionsService;
using System;
using System.Collections.Generic;
using System.Text;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsLecturerDTO
    {
        public string? lecturerId { get; set; }
        public int numberOfCheckedSolutions { get; set; }
    }
}
