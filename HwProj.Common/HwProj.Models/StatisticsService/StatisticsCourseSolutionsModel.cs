using HwProj.Models.SolutionsService;

namespace HwProj.Models.StatisticsService
{
    public class StatisticsCourseSolutionsModel
    {
        public StatisticsCourseSolutionsModel(Solution? model)
        {
            if (model != null)
            {
                Id = model.Id;
                State = model.State;
                Rating = model.Rating;
            }
            
        }
        
        public long? Id { get; set; } 
        public SolutionState? State { get; set; }
        public int? Rating { get; set; }
    }
}
