using System.Collections.Generic;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseMatesModel
    {
        public string StudentId;
        public string Name;
        public string Surname;
        public List<StatisticsMateHomeworksModel> MateHomeworks { get; set; } = new List<StatisticsMateHomeworksModel>();
    }
}
