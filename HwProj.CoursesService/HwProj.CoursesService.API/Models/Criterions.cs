using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models
{
    public class Criterions : IEntity<long>
    {
        public long Id { get; set; }
        public long TaskId { get; set; }
        public string Type { get; set; }
        public string Name { get; set; }
        public int Points { get; set; }
    }
}
