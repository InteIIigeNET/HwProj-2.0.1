using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
    public class ReviewerProfile : IProfile
    {
        public ReviewerProfile()
        {
            CourseWorks = new List<CourseWork>();
            ReviewersInCuratorsBidding = new List<ReviewersInCuratorsBidding>();
        }

        public User User { get; set; }

        public List<CourseWork> CourseWorks { get; set; }
        public List<ReviewersInCuratorsBidding> ReviewersInCuratorsBidding { get; set; }
        public string Id { get; set; }

        [Required] public string UserId { get; set; }
    }
}
