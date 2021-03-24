using HwProj.Repositories;
using System.ComponentModel.DataAnnotations;

namespace HwProj.CoursesService.API.Models
{
    public class TaskModel : IEntity<long>
    {
        [Key]
        public long Id { get; set; }
        
        public long TaskId { get; set; }

        public long GroupId { get; set; }
    }
}
