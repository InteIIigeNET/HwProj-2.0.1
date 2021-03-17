using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
	public class Bid : IEntity<long>
	{
		public long Id { get; set; }

		public string ReviewerProfileId { get; set; }
		public ReviewerProfile ReviewerProfile { get; set; }

		public long CourseWorkId { get; set; }
		public CourseWork CourseWork { get; set; }

		public BiddingValues BiddingValue { get; set; }
	}

	public enum BiddingValues
	{
		Yes = 2,
		Maybe = 1,
		No = -2
	}
}
