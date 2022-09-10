using System.Collections.Generic;
using HwProj.Models.StatisticsService;

namespace HwProj.APIGateway.API.Models
{
    public class StatisticsCourseMatesModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public List<StatisticsCourseHomeworksModel> Homeworks { get; set; } = new List<StatisticsCourseHomeworksModel>();
    }
}
