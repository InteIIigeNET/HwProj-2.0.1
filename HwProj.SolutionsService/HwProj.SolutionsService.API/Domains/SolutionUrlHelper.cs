using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.API.Models;
using Octokit;

namespace HwProj.SolutionsService.API.Domains
{
    public static class SolutionHelper
    {
        public const string PullRequestPattern =
            @"https://github\.com/(?<owner>[^/]+)/(?<repo>[^/]+)/pull/(?<number>\d+)/.*";
        
        public static PullRequestDto ParsePullRequestUrl(string url)
        {
            if (url is null)
                throw new ArgumentNullException(nameof(url));
        
            var regex = new Regex(PullRequestPattern);
            var match = regex.Match(url);
        
            if (match.Success)
            {
                return new PullRequestDto
                {
                    Owner = match.Groups["owner"].Value,
                    Name = match.Groups["repo"].Value,
                    Number = int.Parse(match.Groups["number"].Value),
                };
            }

            throw new InvalidOperationException(nameof(url));
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