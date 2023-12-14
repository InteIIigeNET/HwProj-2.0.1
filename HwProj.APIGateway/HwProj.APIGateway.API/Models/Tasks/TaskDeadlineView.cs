using HwProj.Models.CoursesService.DTO;
using HwProj.Models.SolutionsService;

namespace HwProj.APIGateway.API.Models.Tasks
{
    public class TaskDeadlineView
    {
        public TaskDeadlineDto Deadline { get; set; }
        public SolutionState? SolutionState { get; set; }
        public long? Rating { get; set; }
        public bool DeadlinePast { get; set; }
    }
}
