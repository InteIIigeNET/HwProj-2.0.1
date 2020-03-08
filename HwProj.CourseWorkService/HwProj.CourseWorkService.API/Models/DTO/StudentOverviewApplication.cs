using System;

namespace HwProj.CourseWorkService.API.Models.DTO
{
    public class StudentOverviewApplication
    {
        public long Id { get; set; }

        public long CourseWorkId { get; set; }

        public string Message { get; set; }

        public DateTime DateOfApplication { get; set; }
    }
}
