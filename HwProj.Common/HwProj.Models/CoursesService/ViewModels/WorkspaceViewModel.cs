using System.Collections.Generic;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class WorkspaceViewModel
    {
        public List<string> StudentIds { get; set; } = new List<string>();

        public List<long> HomeworkIds { get; set; } = new List<long>();

        public List<string> MentorIds { get; set; } = new List<string>();

    }
}