namespace HwProj.SolutionsService.API.Models
{
    internal class PullRequestDto
    {
        public string Owner { get; set; }

        public string RepoName { get; set; }

        public int Number { get; set; }
    }
}