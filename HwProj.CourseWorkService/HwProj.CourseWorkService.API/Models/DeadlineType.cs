using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
	public enum DeadlineTypes
	{
		ChoiceTheme = 1,
		CourseWorkText,
		Corrections,
		Protection,
		Bidding,
		Reviewing
	}

	public class DeadlineType : IEntity<long>
	{
		public long Id { get; set; }
		public string DisplayValue { get; set; }
		public List<Deadline> Deadlines { get; set; }

		public DeadlineType()
		{
			Deadlines = new List<Deadline>();
		}
	}
}
