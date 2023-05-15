using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.Models.SolutionsService.Events;

public class RateEvent : Event
{
    public HomeworkTaskViewModel Task { get; set; }
    public SolutionViewModel Solution { get; set; }

    public RateEvent(HomeworkTaskViewModel task, SolutionViewModel solution)
    {
        Task = task;
        Solution = solution;
    }
}