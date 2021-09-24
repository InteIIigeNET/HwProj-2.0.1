using System.Collections.Generic;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseMatesModel
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public List<StatisticsCourseHomeworksModel> Homeworks { get; set; } = new List<StatisticsCourseHomeworksModel>();
    }
}
