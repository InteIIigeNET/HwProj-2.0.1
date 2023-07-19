using HwProj.Models.AuthService.DTO;
using HwProj.Models.SolutionsService;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.APIGateway.API.Models.Solutions
{
    public class UserTaskSolutions
    {
        public GetSolutionModel[] Solutions { get; set; }
        public AccountDataDto User { get; set; }
    }

    public class TaskSolutionStatisticsPageData
    {
        public UserTaskSolutions[] StudentsSolutions { get; set; }
        public AssignmentViewModel[] Assignments { get; set; }
        public long CourseId { get; set; }
    }
}
