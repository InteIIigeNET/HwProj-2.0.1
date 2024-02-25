using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;

namespace HwProj.Models.Events.SolutionEvents
{
    public class RateEvent : Event
    {
        public HomeworkTaskViewModel Task { get; set; }
        public SolutionViewModel Solution { get; set; }

        public override string EventName => "RateEvent";
        public override EventCategory Category => EventCategory.Solutions;

        public RateEvent(HomeworkTaskViewModel task, SolutionViewModel solution)
        {
            Task = task;
            Solution = solution;
        }
    }
}
