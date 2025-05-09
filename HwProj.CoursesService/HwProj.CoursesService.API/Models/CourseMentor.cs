using System.ComponentModel.DataAnnotations.Schema;

namespace HwProj.CoursesService.API.Models
{
    [Table("CourseMentors")]
    public class CourseMentor
    {
        public string UserId { get; set; }
        public long CourseId { get; set; }
    }
}
