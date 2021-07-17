using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
	public class ReviewersInCuratorsBidding : IEntity<long>
	{
		public CuratorProfile CuratorProfile { get; set; }
		public string CuratorProfileId { get; set; }

		public ReviewerProfile ReviewerProfile { get; set; }
		public string ReviewerProfileId { get; set; }
		public long Id { get; set; }
	}
}