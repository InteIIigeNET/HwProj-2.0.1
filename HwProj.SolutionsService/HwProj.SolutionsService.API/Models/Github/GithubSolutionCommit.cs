namespace HwProj.SolutionsService.API.Models
{
    public class GithubSolutionCommit
    {
        public long SolutionId { get; set; }

        public string CommitHash { get; set; } = null!;
    }
}