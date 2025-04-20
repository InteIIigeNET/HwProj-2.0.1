using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class CourseMate : IEntity<long>
    {
        [Key] public long Id { get; set; }

        public long CourseId { get; set; }

        public string StudentId { get; set; }

        public bool IsAccepted { get; set; }

        public StudentCharacteristics? Characteristics { get; set; }
    }

    public class StudentCharacteristics
    {
        [Key] public long CourseMateId { get; set; }
        public string Tags { get; set; }
        public string Description { get; set; }
    }
}
