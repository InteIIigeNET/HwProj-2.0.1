using HwProj.EventBus.Client;

namespace HwProj.CoursesService.API.Events
{
    public class UpdateTaskMaxRatingEvent : Event
    {
        public long TaskId { get; set; }
        public int MaxRating { get; set; }

        public UpdateTaskMaxRatingEvent(long taskId, int rating)
        {
            TaskId = taskId;
            MaxRating = rating;
        }
    }
}
