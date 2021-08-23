using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.SolutionsService
{
    public class SolutionViewModel
    {
        [Required]
        public string GithubUrl { get; set; }
        
        public string Comment { get; set; }
        
        public string StudentId { get; set; }
    }
}
