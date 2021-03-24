using HwProj.Repositories;

namespace HwProj.HomeworkService.API.Models
{
    public class HomeworkTask : IEntity<long>
    {
        public long Id { get; set; }
        
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        public int MaxRating { get; set; }
        
        public long HomeworkId { get; set; }
        
        public Homework Homework { get; set; }
    }
}
