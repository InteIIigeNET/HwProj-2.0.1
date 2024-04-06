using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class TagViewModel
    {
        public long Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }
    }
    public class CreateTagViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Title { get; set; }

        public string Description { get; set; }
    }
}