using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public class ReviewerProfile : IEntity<string>
    {
        public string Id { get; set; }

        public string UserId { get; set; }
        public User User { get; set; }

        public ICollection<CourseWork> CourseWorks { get; set; }

        public ReviewerProfile()
        {
            CourseWorks = new List<CourseWork>();
        }
    }
}
