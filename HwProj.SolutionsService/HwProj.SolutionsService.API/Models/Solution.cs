using HwProj.Repositories;

namespace HwProj.SolutionsService.API.Models
{
    public class Solution : IEntity
    {
        public long Id { get; set; }

        public string GithubUrl { get; set; }
        
        public string Comment { get; set; }
        
        public string StudentId { get; set; }
        
        public long TaskId { get; set; }
    }
}