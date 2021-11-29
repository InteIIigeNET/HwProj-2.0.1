using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class GroupMate : IEntity<long>
    {
        public long GroupId { get; set; }

        public string StudentId { get; set; }

        [Key] public long Id { get; set; }
    }
}
