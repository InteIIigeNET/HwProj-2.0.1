using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.API.Models;
using Octokit;

namespace HwProj.SolutionsService.API.Domains
{
    internal static class SolutionHelper
    {
        private static Regex _pullRequestRegex = new Regex(
                @"https:\/\/github\.com\/(?<owner>[^\/]+)\/(?<repo>[^\/]+)\/pull\/(?<number>\d+)(\/.*)?",
                RegexOptions.Compiled);
        
        public static PullRequestDto? TryParsePullRequestUrl(string url)
        {
            if (url is null)
                throw new ArgumentNullException(nameof(url));
            
            var match = _pullRequestRegex.Match(url);
        
            if (match.Success)
            {
                return new PullRequestDto
                {
                    Owner = match.Groups["owner"].Value,
                    Name = match.Groups["repo"].Value,
                    Number = int.Parse(match.Groups["number"].Value),
                };
            }

            return null;
        }
        
        public static SolutionActualityDto GetCommitActuality(
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