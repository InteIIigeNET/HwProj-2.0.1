using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class CourseMate : IEntity<long>
    {
        public long CourseId { get; set; }

        public string StudentId { get; set; }

        public bool IsAccepted { get; set; }

        [Key] public long Id { get; set; }
    }
}
