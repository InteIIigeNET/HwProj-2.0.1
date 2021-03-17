using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;

namespace HwProj.CourseWorkService.API.Services.Interfaces
{
	public interface IReviewService
	{
		Task SetReviewersToBidding(string userId, string[] reviewersId);
		Task<UserDTO[]> GetReviewersInBidding(string curatorId);
		Task<ReviewerOverviewCourseWorkDTO[]> GetCourseWorksInBiddingForReviewer(string reviewerId);
		Task CreateCourseWorkBid(string userId, long courseWorkId, BiddingValues biddingValue);
	}
}
