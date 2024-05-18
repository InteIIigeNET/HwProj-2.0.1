using System.Collections.Generic;
using System.Linq;
using Octokit;

namespace HwProj.SolutionsService.API.Models
{
    public class SolutionActualityDto
    {
        public bool isActual { get; set; }
        
        public string Comment { get; set; }
        
        public string AdditionalData { get; set; }

        public static SolutionActualityDto Create(
            IEnumerable<PullRequestCommit> pullRequestCommits,
            GithubSolutionCommit lastSolutionCommit)
        {
            var pullRequestCommitsSha = pullRequestCommits.Select(c => c.Sha).ToHashSet();

            var comment = string.Empty;

            if (!pullRequestCommitsSha.Contains(lastSolutionCommit.CommitHash))
                comment = "Последнего коммита решения в текущей ветке не найдено. Возможно, был произведен force push";
            else if (pullRequestCommitsSha.Last() != lastSolutionCommit.CommitHash)
                comment = "С момента сдачи последнего решения были добавлены новые коммиты";

            return new SolutionActualityDto
            {
                isActual = comment == string.Empty,
                Comment = comment,
                AdditionalData = lastSolutionCommit.CommitHash
            };
        }
    }
}