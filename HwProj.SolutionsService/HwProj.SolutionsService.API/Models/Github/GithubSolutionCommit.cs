using System.ComponentModel.DataAnnotations.Schema;
using HwProj.Repositories;

namespace HwProj.SolutionsService.API.Models
{
    public class GithubSolutionCommit : IEntity<long>
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long Id { get; set; }

        public string CommitHash { get; set; } = null!;
    }
}