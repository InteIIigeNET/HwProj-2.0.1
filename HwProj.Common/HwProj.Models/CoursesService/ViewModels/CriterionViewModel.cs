using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public enum CriterionType
    {
        Free = 0
    }

    public class CriterionViewModel
    {
        public long Id { get; set; }   
        public CriterionType Type { get; set; }
        [Required] public string Name { get; set; } = null!;
        [Range(0, int.MaxValue)] public int MaxPoints { get; set; }
    }
}
