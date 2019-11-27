using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Models.CourseWorkViewModels
{
    public class CreateCourseWorkViewModel
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        public string Type { get; set; }

        public string Publicity { get; set; }

        public string Requirements { get; set; }


        public string SupervisorContact { get; set; }
        public string Consultant { get; set; }
        public string ConsultantContact { get; set; }
    }
}
