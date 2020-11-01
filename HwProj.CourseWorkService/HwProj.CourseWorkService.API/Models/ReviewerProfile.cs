using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public class ReviewerProfile : IEntity<string>
    {
        public string Id { get; set; }

        [Required]
        public string UserId { get; set; }
        public User User { get; set; }

        public ICollection<CourseWork> CourseWorks { get; set; }

        public ReviewerProfile()
        {
            CourseWorks = new List<CourseWork>();
        }
    }
}
