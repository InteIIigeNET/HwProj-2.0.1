using System.Collections.Generic;

namespace HwProj.Models.CoursesService.DTO
{
    public class CreateCourseFilterDTO
    {
        public string UserId { get; set; }

        public List<string> StudentIds { get; set; } = new List<string>();

        public List<long> HomeworkIds { get; set; } = new List<long>();

        public List<string> MentorIds { get; set; } = new List<string>();
    }
}