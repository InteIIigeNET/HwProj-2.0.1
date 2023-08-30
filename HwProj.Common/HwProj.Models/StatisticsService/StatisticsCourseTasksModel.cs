using System.Collections.Generic;
using HwProj.Models.SolutionsService;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseTasksModel
    {
        public long Id { get; set; }
        public List<Solution> Solution { get; set; } = new List<Solution>();
    }
}
