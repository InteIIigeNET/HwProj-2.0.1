﻿namespace HwProj.CourseWorkService.API.Models.DTO
{
    public class OverviewCourseWorkDTO
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Type { get; set; }
        public string SupervisorName { get; set; }
        public string Overview { get; set; }
        public int Course { get; set; }
        public string StudentName { get; set; }
    }
}
