namespace HwProj.CourseWorkService.API.Models.DTO
{
    public class DeadlineDTO
    {
		public long Id { get; set; }
		public string Date { get; set; }
		public int? Course { get; set; }
		public long? DirectionId { get; set; }
		public string DirectionName { get; set; }
		public long DeadlineTypeId { get; set; }
		public string DeadlineTypeName { get; set; }
	}
}
