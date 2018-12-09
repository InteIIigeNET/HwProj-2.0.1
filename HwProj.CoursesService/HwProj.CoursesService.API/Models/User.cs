using System.Collections.Generic;
using System.Linq;

namespace HwProj.CoursesService.API.Models
{
    public class User
    {
        public long Id { get; set; }
        public string Name { get; set; }

        public List<CourseStudent> CourseStudents { get; set; } = new List<CourseStudent>();

        public override bool Equals(object obj)
        {
            if (!(obj is User other))
            {
                return false;
            }

            return Id == other.Id && Name == other.Name && Enumerable.SequenceEqual(CourseStudents, other.CourseStudents);
        }
    }
}
