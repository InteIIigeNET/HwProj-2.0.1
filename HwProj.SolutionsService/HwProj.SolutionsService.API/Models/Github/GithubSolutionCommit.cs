using HwProj.Models.SolutionsService;
using HwProj.Repositories;

namespace HwProj.SolutionsService.API.Models
{
    public class GithubSolutionCommit : IEntity<long>
    {
        public long Id { get; set; }
        
        public long SolutionId { get; set; }
        
        public Solution Solution { get; set; }

        public string CommitHash { get; set; } = null!;
    }
}