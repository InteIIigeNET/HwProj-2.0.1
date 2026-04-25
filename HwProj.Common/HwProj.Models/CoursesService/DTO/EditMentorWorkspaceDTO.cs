using System.Collections.Generic;

namespace HwProj.Models.CoursesService.DTO
{
    public class EditMentorWorkspaceDTO
    {
        public List<long> GroupIds { get; set; } = new List<long>();

        public List<string> StudentIds { get; set; } = new List<string>();

        public List<long> HomeworkIds { get; set; } = new List<long>();
    }
}