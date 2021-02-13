using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services.Interfaces
{
	public interface IReviewService
	{
		Task SetReviewersToBidding(string userId, string[] reviewersId);
	}
}
