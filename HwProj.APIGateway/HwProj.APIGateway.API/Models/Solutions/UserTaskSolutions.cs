using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;

namespace HwProj.APIGateway.API.Models.Solutions
{
    public class UserTaskSolutions
    {
        public GetSolutionModel[] Solutions { get; set; }
        public AccountDataDto User { get; set; }
    }

    public class UserTaskSolutions2
    {
        public string Title { get; set; }
        public string TaskId { get; set; }
        public GetSolutionModel[] Solutions { get; set; }
    }

    public class TaskSolutionStatisticsPageData
    {
        public UserTaskSolutions[] StudentsSolutions { get; set; }
        public long CourseId { get; set; }
        public TaskSolutionsStats[] StatsForTasks { get; set; }
    }

    public class UserTaskSolutionsPageData
    {
        public long CourseId { get; set; }
        public AccountDataDto[] CourseMates { get; set; }
        public HomeworkTaskViewModel Task { get; set; }
        public UserTaskSolutions2[] TaskSolutions { get; set; }
    }
}
