namespace HwProj.SolutionsService.API.Models
{
    public class CreateSolutionViewModel
    {
        public string GithubUrl { get; set; }
        
        public string Comment { get; set; }
        
        public string StudentId { get; set; }
    }

    public class SolutionViewModel
    {
        public long Id { get; set; }

        public string GithubUrl { get; set; }
        
        public string Comment { get; set; }

        public string State { get; set; }
        
        public string StudentId { get; set; }
        
        public long TaskId { get; set; }
    }
}