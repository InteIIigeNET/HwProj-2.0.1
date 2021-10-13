using System.Collections.Generic;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseGroupModel
    {
        public long? Id { get; set; }
        public string? Name { get; set; }
        public List<StatisticsCourseHomeworksModel> Homeworks { get; set; } = new List<StatisticsCourseHomeworksModel>();
    }
}
