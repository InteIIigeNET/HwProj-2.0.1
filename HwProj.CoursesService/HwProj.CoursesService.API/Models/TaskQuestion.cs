using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class TaskQuestion : IEntity<long>
    {
        [Key] public long Id { get; set; }
        public long TaskId { get; set; }

        public string StudentId { get; set; }
        [MaxLength(1000)] public string Text { get; set; }
        public bool IsPrivate { get; set; }

        public string? LecturerId { get; set; }
        [MaxLength(1000)] public string? Answer { get; set; }
    }
}
