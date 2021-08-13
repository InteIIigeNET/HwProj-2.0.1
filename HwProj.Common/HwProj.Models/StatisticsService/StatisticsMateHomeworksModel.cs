using System.Collections.Generic;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsMateHomeworksModel
    {
        public long? HomeworkId;
        public List<StatisticsHomeworkTasksModel> HomeworkTasks { get; set; } = new List<StatisticsHomeworkTasksModel>();
    }
}
