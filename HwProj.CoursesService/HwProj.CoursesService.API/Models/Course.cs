using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace HwProj.CoursesService.API.Models
{
    public class Course
    {
        [Key]
        public long Id { get; set; }
        public string Name { get; set; }
        public string GroupName { get; set; }
        public bool IsOpen { get; set; }
        public bool IsComplete { get; set; }

        public long MentorId { get; set; }
        [ForeignKey(nameof(MentorId))]
        public User Mentor { get; set; }

        public List<CourseStudent> CourseStudents { get; set; } = new List<CourseStudent>();

        public override bool Equals(object obj)
        {
            if (!(obj is Course other))
            {
                return false;
            }

            return Id == other.Id && Name == other.Name && GroupName == other.GroupName
                && IsOpen == other.IsOpen && IsComplete == other.IsComplete && Enumerable.SequenceEqual(CourseStudents, other.CourseStudents);
        }
    }
}
