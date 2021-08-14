using HwProj.Models.SolutionsService;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseSolutionsModel
    {
        public StatisticsCourseSolutionsModel(Solution model)
        {
            Id = model.Id;
            State = model.State;
            Rating = model.Rating;
            MaxRating = model.MaxRating;
        }
        
        public long? Id { get; set; } 
        public SolutionState? State { get; set; }
        public int? Rating { get; set; }
        public int? MaxRating { get; set; }
    }
}
