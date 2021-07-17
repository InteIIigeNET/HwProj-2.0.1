namespace HwProj.CourseWorkService.API.Models.DTO
{
	public class ReviewersDistributionDTO
	{
		public long CourseWorkId { get; set; }
		public string CourseWorkName { get; set; }

		public string ReviewerId { get; set; }
		public string ReviewerName { get; set; }
	}
}