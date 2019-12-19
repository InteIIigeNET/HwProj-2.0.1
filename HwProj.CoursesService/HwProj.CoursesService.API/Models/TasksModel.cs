using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class TasksModel : IEntity
    {
        public long Id { get; set; }

         public long TaskId { get; set; }

        public long GroupId { get; set; }
    }
}
