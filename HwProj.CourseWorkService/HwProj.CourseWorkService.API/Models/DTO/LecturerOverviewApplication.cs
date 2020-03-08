using System;

namespace HwProj.CourseWorkService.API.Models.DTO
{
    public class LecturerOverviewApplication
    {
        public long Id { get; set; }

        public string StudentName { get; set; }

        public string Message { get; set; }

        public DateTime DateOfApplication { get; set; }
    }
}
