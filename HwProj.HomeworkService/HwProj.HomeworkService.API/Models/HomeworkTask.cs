using HwProj.Repositories;

namespace HwProj.HomeworkService.API.Models
{
	public class HomeworkTask : IEntity<long>
	{
		public string Title { get; set; }

		public string Description { get; set; }

		public long HomeworkId { get; set; }

		public Homework Homework { get; set; }
		public long Id { get; set; }
	}
}