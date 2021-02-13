namespace HwProj.CourseWorkService.API.Models.ViewModels
{
    public class AddDeadlineViewModel
    {
	    public string Date { get; set; }
	    public int? Course { get; set; }
	    public long? DirectionId { get; set; }
	    public long DeadlineTypeId { get; set; }
	    public long? CourseWorkId { get; set; }
	}
}
