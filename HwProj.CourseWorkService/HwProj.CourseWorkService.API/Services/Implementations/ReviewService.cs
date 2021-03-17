using System.Linq;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Exceptions;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services.Implementations
{
	#region Class: ReviewService

	public class ReviewService : IReviewService
	{
		#region Fields: Private

		private readonly IViewModelService _viewModelService;
		private readonly ICourseWorksRepository _courseWorksRepository;
		private readonly IUsersRepository _usersRepository;

		#endregion

		#region Constructors: Public

		public ReviewService(IViewModelService viewModelService, ICourseWorksRepository courseWorksRepository, 
			IUsersRepository usersRepository)
		{
			_viewModelService = viewModelService;
			_courseWorksRepository = courseWorksRepository;
			_usersRepository = usersRepository;
		}

		#endregion

		#region Methods: Public

		public async Task SetReviewersToBidding(string userId, string[] reviewersId)
		{
			await _usersRepository.SetReviewersToCuratorBidding(userId, reviewersId).ConfigureAwait(false);
		}

		public async Task<UserDTO[]> GetReviewersInBidding(string curatorId)
		{
			var reviewers = await _usersRepository.GetUsersByRoleAsync(Roles.Reviewer).ConfigureAwait(false);
			return reviewers
				.Where(r =>
					r.ReviewerProfile.ReviewersInCuratorsBidding
						.Any(e => e.CuratorProfileId == curatorId))
				.Select(_viewModelService.GetUserDTO)
				.ToArray();
		}

		public async Task<ReviewerOverviewCourseWorkDTO[]> GetCourseWorksInBiddingForReviewer(string reviewerId)
		{
			var courseWorks = await _courseWorksRepository
				.GetAll()
				.Include(cw => cw.CuratorProfile)
					.ThenInclude(cp => cp.ReviewersInCuratorsBidding)
				.Where(cw => 
					!cw.IsCompleted 
					&& cw.ReviewerProfileId == null 
					&& cw.CuratorProfile.ReviewersInCuratorsBidding
						.Any(e => e.ReviewerProfileId == reviewerId))
				.ToArrayAsync()
				.ConfigureAwait(false);
			return await Task.WhenAll(courseWorks.Select(async cw =>
				await _viewModelService.GetReviewerOverviewCourseWorkDTO(cw).ConfigureAwait(false)));
		}

		public async Task CreateCourseWorkBid(string userId, long courseWorkId, BiddingValues biddingValue)
		{
			var availableCourseWorks = await GetCourseWorksInBiddingForReviewer(userId)
				.ConfigureAwait(false);
			var courseWork = availableCourseWorks.FirstOrDefault(cw => cw.Id == courseWorkId);
			if (courseWork == null) throw new ObjectNotFoundException($"Course work with id {courseWorkId}");

			await _courseWorksRepository.AddBidInCourseWork(courseWorkId, userId, biddingValue).ConfigureAwait(false);
		}

		#endregion
	}

	#endregion
}
