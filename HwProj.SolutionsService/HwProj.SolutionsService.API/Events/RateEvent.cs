using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;

namespace HwProj.SolutionsService.API.Events
{
    public class RateEvent : Event
    {
        public HomeworkTaskViewModel Task { get; }
        public SolutionViewModel Solution { get; }
        
        public long SolutionId { get; }

        public RateEvent(HomeworkTaskViewModel task, SolutionViewModel solution, long solutionId)
        {
            Task = task;
            Solution = solution;
            SolutionId = solutionId;
        }
    }
}
