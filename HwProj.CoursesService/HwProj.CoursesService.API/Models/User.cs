using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace HwProj.CoursesService.API.Models
{
    public class User
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public string Id { get; set; }

        public List<CourseStudent> CourseStudents { get; set; } = new List<CourseStudent>();

        public override bool Equals(object obj)
        {
            if (!(obj is User other))
            {
                return false;
            }

            return Id == other.Id && Enumerable.SequenceEqual(CourseStudents, other.CourseStudents);
        }
    }
}
