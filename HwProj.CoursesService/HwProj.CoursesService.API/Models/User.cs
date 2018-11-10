using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models
{
    public class User
    {
        public long Id { get; set; }
        public string Name { get; set; }

        public List<CourseStudent> Courses { get; set; } = new List<CourseStudent>();
    }
}
