using HwProj.EventBus.Client;

namespace HwProj.SolutionsService.API.Events
{
    public class RequestCalculatedMaxRatingEvent : Event
    {
        public long TaskId { get; set; }
        public long SolutionId { get; set; }
        public string StudentId { get; set; }
        public int TaskMaxRating { get; set; }

        public RequestCalculatedMaxRatingEvent(long taskId, long solutionId, string studentId, int taskMaxRating)
        {
            TaskId = taskId;
            SolutionId = solutionId;
            StudentId = studentId;
            TaskMaxRating = taskMaxRating;
        }
    }
}
