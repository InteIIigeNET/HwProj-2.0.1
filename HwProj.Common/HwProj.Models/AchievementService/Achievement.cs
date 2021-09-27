using HwProj.Repositories;

namespace HwProj.Models.AchievementService
{
    public class Achievement : IEntity<long>
    {
        public long Id { get; set; }
        
        public string Description { get; set; }
        
        public long TaskId { get; set; }
    }
}