using System.Collections.Generic;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseMatesDto
    {
        public string StudentId { get; set; }
        public List<StatisticsCourseHomeworksModel> Homeworks { get; set; }
    }
}
