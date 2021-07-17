using System;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
	public class Deadline : IEntity<long>
	{
		public DateTime Date { get; set; }
		public int? Course { get; set; }

		public long? DirectionId { get; set; }
		public Direction Direction { get; set; }

		public string CuratorProfileId { get; set; }
		public CuratorProfile CuratorProfile { get; set; }

		public long DeadlineTypeId { get; set; }
		public DeadlineType DeadlineType { get; set; }

		public long? CourseWorkId { get; set; }
		public CourseWork CourseWork { get; set; }
		public long Id { get; set; }
	}
}