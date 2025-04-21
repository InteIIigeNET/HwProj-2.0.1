using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;

namespace HwProj.APIGateway.API.Models.Solutions
{
    public class UserTaskSolutions
    {
        public GetSolutionModel[] Solutions { get; set; }
        public StudentDataDto Student { get; set; }
    }

    public class UserTaskSolutions2
    {
        public int MaxRating { get; set; }
        public string Title { get; set; }
        public string[] Tags { get; set; }
        public string TaskId { get; set; }
        public GetSolutionModel[] Solutions { get; set; }
    }

    public class TaskSolutionStatisticsPageData
    {
        public TaskSolutions[] TaskSolutions { get; set; }
        public long CourseId { get; set; }
        public HomeworksGroupSolutionStats[] StatsForTasks { get; set; }
    }

    public class UserTaskSolutionsPageData
    {
        public long CourseId { get; set; }
        public AccountDataDto[] CourseMates { get; set; }
        public HomeworksGroupUserTaskSolutions[] TaskSolutions { get; set; }
    }

    public class HomeworksGroupUserTaskSolutions
    {
        public string? GroupTitle { get; set; }
        public HomeworkUserTaskSolutions[] HomeworkSolutions { get; set; }
    }

    public class HomeworkUserTaskSolutions
    {
        public string HomeworkTitle { get; set; }
        public UserTaskSolutions2[] StudentSolutions { get; set; }
    }


    public class TaskSolutions
    {
        public long TaskId { get; set; }
        public UserTaskSolutions[] StudentSolutions { get; set; }
    }

    public class HomeworksGroupSolutionStats
    {
        public string? GroupTitle { get; set; }
        public HomeworkSolutionsStats[] StatsForHomeworks { get; set; }
    }

    public class HomeworkSolutionsStats
    {
        public string HomeworkTitle { get; set; }
        public TaskSolutionsStats[] StatsForTasks { get; set; }
    }
}
