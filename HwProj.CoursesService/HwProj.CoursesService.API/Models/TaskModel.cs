using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class TaskModel : IEntity<long>
    {
        public long TaskId { get; set; }

        public long GroupId { get; set; }

        [Key] public long Id { get; set; }
    }
}
