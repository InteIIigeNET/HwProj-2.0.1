namespace HwProj.CoursesService.API.Models
{
    public class UserToCourseFilter
    {
        public long CourseId { get; set; }
        public string? UserId { get; set; }
        public long CourseFilterId { get; set; }
    }
}