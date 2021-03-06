using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Models.DTO
{
	public class ReviewerOverviewCourseWorkDTO
	{
		public long Id { get; set; }
		public string Title { get; set; }
		public string Type { get; set; }
		public string SupervisorName { get; set; }
		public string Overview { get; set; }
		public int Course { get; set; }
		public string StudentName { get; set; }
		public string BiddingDeadline { get; set; }
	}
}
