using System.ComponentModel.DataAnnotations;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Models
{
    public class GroupMate : IEntity<long>
    {
        [Key]
        public long Id { get; set; }

        public long GroupId { get; set; }

        public string StudentId { get; set; }
    }
}
