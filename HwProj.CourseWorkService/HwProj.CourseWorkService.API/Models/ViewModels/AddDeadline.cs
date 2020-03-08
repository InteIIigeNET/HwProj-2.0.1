using System;

namespace HwProj.CourseWorkService.API.Models.ViewModels
{
    public class AddDeadline
    {
        public string Type { get; set; }

        public long CourseWorkId { get; set; }

        public DateTime DeadlineDate { get; set; }
    }
}
