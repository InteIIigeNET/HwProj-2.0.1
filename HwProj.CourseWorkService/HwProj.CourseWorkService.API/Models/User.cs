using HwProj.Repositories;
using Microsoft.CodeAnalysis.Operations;

namespace HwProj.CourseWorkService.API.Models
{
    public class User : IEntity
    {
        public long Id { get; set; }
        public string AuthId { get; set; }

        public string Name { get; set; }
        public string Role { get; set; }
        public bool IsReviewer { get; set; }
    }
}
