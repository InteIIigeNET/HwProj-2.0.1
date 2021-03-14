using HwProj.EventBus.Client;

namespace HwProj.SolutionsService.API.Events
{
    public class RequestMaxRatingEvent : Event
    {
        public long TaskId { get; set; }
        public long SolutionId { get; set; }

        public RequestMaxRatingEvent(long taskId, long solutionId)
        {
            TaskId = taskId;
            SolutionId = solutionId;
        }
    }
}
