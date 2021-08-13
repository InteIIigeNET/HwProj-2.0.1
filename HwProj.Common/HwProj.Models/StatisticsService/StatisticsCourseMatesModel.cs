using System.Collections.Generic;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseMatesModel
    {
        public string? StudentId { get; set; }
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public List<StatisticsMateHomeworksModel> MateHomeworks { get; set; } = new List<StatisticsMateHomeworksModel>();
    }
}
