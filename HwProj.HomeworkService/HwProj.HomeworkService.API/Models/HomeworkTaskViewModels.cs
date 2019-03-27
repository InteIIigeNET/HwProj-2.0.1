namespace HwProj.HomeworkService.API.Models
{
    public class HomeworkTaskViewModel
    {
        public long Id { get; set; }
        
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        public long HomeworkId { get; set; }
    }

    public class CreateTaskViewModel
    {
        public string Title { get; set; }
        public string Description { get; set; }
    }
}