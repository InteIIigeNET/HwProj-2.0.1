using HwProj.Models.SolutionsService;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseAdvancedDto
    {
        public long CourseId;
        public StatisticsCourseMeasureSolutionModel[] AverageStudentSolutions { get; set; }
        public StatisticsCourseMeasureSolutionModel[] BestStudentSolutions { get; set; }
    }
}