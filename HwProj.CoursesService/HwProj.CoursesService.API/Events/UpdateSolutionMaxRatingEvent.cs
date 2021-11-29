using HwProj.EventBus.Client;

namespace HwProj.CoursesService.API.Events
{
    public class UpdateSolutionMaxRatingEvent : Event
    {
        public UpdateSolutionMaxRatingEvent(long taskId, long solutionId, int rating)
        {
            TaskId = taskId;
            MaxRating = rating;
            SolutionId = solutionId;
        }

        public long TaskId { get; set; }
        public long SolutionId { get; set; }
        public int MaxRating { get; set; }
    }
}
