using HwProj.Repositories;

namespace HwProj.HomeworkService.API.Models
{
    public class HomeworkTask : IEntity
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        
        public long HomeworkId { get; set; }
        public Homework Homework { get; set; }
    }
}