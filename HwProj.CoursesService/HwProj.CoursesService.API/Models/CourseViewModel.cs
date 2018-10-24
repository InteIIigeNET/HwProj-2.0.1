using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models
{
    public class CourseViewModel
    {
        [Required]
        [RegularExpression(@"^\S", ErrorMessage = "Name shouldn't start with wihte spaces.")]
        public string Name { get; set; }
    }
}
