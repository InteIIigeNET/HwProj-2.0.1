using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class Student : IEntity
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long Id { get; set; }

        public List<CourseStudent> CourseStudents { get; set; } = new List<CourseStudent>();
    }
}
