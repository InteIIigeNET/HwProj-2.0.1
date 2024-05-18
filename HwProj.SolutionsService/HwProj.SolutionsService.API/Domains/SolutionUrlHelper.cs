using System;
using System.Text.RegularExpressions;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Domains
{
    public static class SolutionUrlHelper
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
    }
}