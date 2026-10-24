using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;

namespace HwProj.NotificationService.Events.SolutionsService
{
    public class RateEvent : Event
    {
        public HomeworkTaskViewModel Task { get; set; }
        public SolutionViewModel Solution { get; set; }
        public long CourseId { get; set; }

        public RateEvent(HomeworkTaskViewModel task, SolutionViewModel solution, long courseId)
        {
            Task = task;
            Solution = solution;
            CourseId = courseId;
        }
    }
}
