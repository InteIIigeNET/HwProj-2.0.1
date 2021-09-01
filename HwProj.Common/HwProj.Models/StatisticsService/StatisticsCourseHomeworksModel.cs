using System.Collections.Generic;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseHomeworksModel
    {
        public long? Id;
        public List<StatisticsCourseTasksModel> Tasks { get; set; } = new List<StatisticsCourseTasksModel>();
    }
}
