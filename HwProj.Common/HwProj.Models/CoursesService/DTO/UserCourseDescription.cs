namespace HwProj.Models.CoursesService.DTO
{
    public class UserCourseDescription
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string GroupName { get; set; }
        public bool IsOpen { get; set; }
        public bool IsCompleted { get; set; }
        public bool UserIsMentor { get; set; }
    }
}