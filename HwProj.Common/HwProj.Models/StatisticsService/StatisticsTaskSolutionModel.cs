using HwProj.Models.SolutionsService;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsTaskSolutionModel
    {
        public StatisticsTaskSolutionModel(Solution model)
        {
            SolutionId = model.Id;
            State = model.State;
            Rating = model.Rating;
            MaxRating = model.MaxRating;
        }
        public long SolutionId; 
        public SolutionState State { get; set; }
        public int Rating { get; set; }
        public int MaxRating { get; set; }
    }
}
