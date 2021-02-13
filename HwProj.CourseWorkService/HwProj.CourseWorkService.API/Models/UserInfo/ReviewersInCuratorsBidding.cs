using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
	public class ReviewersInCuratorsBidding
	{
		public CuratorProfile CuratorProfile { get; set; }
		public string CuratorProfileId { get; set; }

		public ReviewerProfile ReviewerProfile { get; set; }
		public string ReviewerProfileId { get; set; }
	}
}
