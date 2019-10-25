namespace HwProj.CoursesService.API.Models.DTO
{
    public class UserCourseDescription
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string GroupName { get; set; }
        public bool IsOpen { get; set; }
        public bool UserIsMentor { get; set; }
    }
}