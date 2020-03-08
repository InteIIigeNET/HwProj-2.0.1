using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public class User : IEntity
    {
        public long Id { get; set; }
        public string AuthId { get; set; }

        public string Name { get; set; }
    }
}
