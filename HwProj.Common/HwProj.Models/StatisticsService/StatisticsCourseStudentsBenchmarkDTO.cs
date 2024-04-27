namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseStudentsBenchmarkDTO
    {
        public long CourseId;
        public StatisticsCourseMeasureSolutionModel[] AverageStudentSolutions { get; set; }
        public StatisticsCourseMeasureSolutionModel[] BestStudentSolutions { get; set; }
    }
}
