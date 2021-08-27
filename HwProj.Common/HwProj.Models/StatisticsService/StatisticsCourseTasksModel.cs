using System.Collections.Generic;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseTasksModel
    {
        public long? Id { get; set; }
        public List<StatisticsCourseSolutionsModel> Solution { get; set; } = new List<StatisticsCourseSolutionsModel>();
    }
}
