using HwProj.Models.AuthService.DTO;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;

namespace HwProj.APIGateway.API.Models.Solutions
{
    public class UserTaskSolutions
    {
        public Solution[] Solutions { get; set; }
        public AccountDataDto User { get; set; }
    }

    public class UserTaskSolutionPreviews
    {
        public StatisticsCourseSolutionsModel[] Solutions { get; set; }
        public AccountDataDto User { get; set; }
    }

    public class TaskSolutionStatisticsPageData
    {
        public UserTaskSolutionPreviews[] StudentsSolutions { get; set; }
        public long CourseId { get; set; }
    }
}
