using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.Models.CoursesService.DTO
{
    public class CourseGroupDTO
    {
        public GroupMateDataDTO[] StudentsWithoutGroup { get; set; }
        public GroupViewModel[] Groups { get; set; }
    }
}
