using System.ComponentModel.DataAnnotations.Schema;

namespace HwProj.CoursesService.API.Models
{
    public class UserToCourseFilter
    {
        public long CourseId { get; set; }
        public string UserId { get; set; }

        public CourseFilter CourseFilter { get; set; }

        [ForeignKey("CourseFilter")]
        public long CourseFilterId { get; set; }
    }
}