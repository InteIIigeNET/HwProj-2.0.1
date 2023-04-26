using HwProj.EventBus.Client;

namespace HwProj.CoursesService.API.Events
{
    public class UpdateSolutionCalculatedMaxRatingEvent : Event
    {
        public long SolutionId { get; set; }
        public int CalculatedRating { get; set; }

        public UpdateSolutionCalculatedMaxRatingEvent(long solutionId, int rating)
        {
            CalculatedRating = rating;
            SolutionId = solutionId;
        }
    }
}
