using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class CriterionViewModel
    {
        public long Id { get; set; }   
        public string? Type { get; set; }
        [Required] public string Name { get; set; } = default!;
        [Range(0, int.MaxValue)] public int Points { get; set; }
    }
}
