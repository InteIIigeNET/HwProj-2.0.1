using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;

namespace HwProj.CourseWorkService.API.Services.Implementations
{
	#region Class: ReviewService

	public class ReviewService : IReviewService
	{
		#region Fields: Private

		private readonly IUsersRepository _usersRepository;

		#endregion

		#region Constructors: Public

		public ReviewService(IUsersRepository usersRepository)
		{
			_usersRepository = usersRepository;
		}

		#endregion

		#region Methods: Public

		public async Task SetReviewersToBidding(string userId, string[] reviewersId)
		{
			await _usersRepository.SetReviewersToCuratorBidding(userId, reviewersId).ConfigureAwait(false);
		}

		#endregion
	}

	#endregion
}
