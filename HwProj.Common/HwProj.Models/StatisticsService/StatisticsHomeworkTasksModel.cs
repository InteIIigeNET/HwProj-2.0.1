using System.Collections.Generic;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsHomeworkTasksModel
    {
        public long? TaskId { get; set; }
        public List<StatisticsTaskSolutionModel> TaskSolution { get; set; } = new List<StatisticsTaskSolutionModel>();
    }
}
