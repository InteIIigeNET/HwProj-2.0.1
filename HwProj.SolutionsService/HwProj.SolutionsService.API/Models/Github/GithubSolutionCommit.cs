using System.ComponentModel.DataAnnotations;
using HwProj.Models.SolutionsService;
using HwProj.Repositories;

namespace HwProj.SolutionsService.API.Models
{
    public class GithubSolutionCommit : IEntity<long>
    {
        public long Id { get; set; }

        public string CommitHash { get; set; } = null!;
    }
}