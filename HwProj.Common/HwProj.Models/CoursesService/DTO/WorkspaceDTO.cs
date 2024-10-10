using System.Collections.Generic;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class WorkspaceDTO
    {
        public List<string> StudentIds { get; set; } = new List<string>();

        public List<long> HomeworkIds { get; set; } = new List<long>();
    }
}