using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.StatisticsService;

namespace HwProj.APIGateway.API.Models.Statistics
{
    public class AdvancedCourseStatisticsViewModel
    {
        public CoursePreview Course { get; set; }
        public HomeworkViewModel[] Homeworks { get; set; }
        public StatisticsCourseMatesModel[] StudentStatistics { get; set; }
        public StatisticsCourseMeasureSolutionModel[] AverageStudentSolutions { get; set; }
        public StatisticsCourseMeasureSolutionModel[] BestStudentSolutions { get; set; }
    }
}