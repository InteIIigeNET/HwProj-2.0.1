using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public class Bid : IEntity
    {
        public long Id { get; set; }

        public long ReviewerId { get; set; }

        public string BidValue { get; set; }

        public long CourseWorkId { get; set; }
        public CourseWork CourseWork { get; set; }

    }
}
