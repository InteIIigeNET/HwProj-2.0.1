namespace HwProj.Models.CoursesService.DTO
{
    public class GroupWithNameDTO
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string[] StudentsIds { get; set; }
    }
}