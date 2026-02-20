using System.ComponentModel.DataAnnotations.Schema;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public enum CriterionType
    {
        Free = 0
    }

    public class Criterion : IEntity<long>
    {
        public long Id { get; set; }
        public HomeworkTask Task { get; set; } = null!;
        [ForeignKey(nameof(Task))]
        public long TaskId { get; set; }
        public CriterionType Type { get; set; }
        public string Name { get; set; }
        public int MaxPoints { get; set; }
    }
}
