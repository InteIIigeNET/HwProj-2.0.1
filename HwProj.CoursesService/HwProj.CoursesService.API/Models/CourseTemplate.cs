using System.Collections.Generic;

namespace HwProj.CoursesService.API.Models
{
    public class CourseTemplate
    {
        public string Name { get; set; }

        public string GroupName { get; set; }

        public List<HomeworkTemplate> Homeworks { get; set; } = new List<HomeworkTemplate>();
    }
}
