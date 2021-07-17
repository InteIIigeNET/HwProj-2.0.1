using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
	public class CuratorProfile : IProfile
	{
		public CuratorProfile()
		{
			Directions = new List<Direction>();
			Deadlines = new List<Deadline>();
			ReviewersInCuratorsBidding = new List<ReviewersInCuratorsBidding>();
		}

		public User User { get; set; }

		public long? DepartmentId { get; set; }
		public Department Department { get; set; }

		public List<Direction> Directions { get; set; }
		public List<Deadline> Deadlines { get; set; }
		public List<ReviewersInCuratorsBidding> ReviewersInCuratorsBidding { get; set; }
		public string Id { get; set; }

		[Required] public string UserId { get; set; }
	}
}