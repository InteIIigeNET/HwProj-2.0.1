using System.Collections.Generic;

namespace HwProj.CoursesService.API.Models
{
    public class HomeworkTemplate
    {
        public string Title { get; set; }

        public string Description { get; set; }

        public bool HasDeadline { get; set; }

        public bool IsDeadlineStrict { get; set; }

        public string? Tags { get; set; }

        public List<HomeworkTaskTemplate> Tasks { get; set; } = new List<HomeworkTaskTemplate>();
    }
}
