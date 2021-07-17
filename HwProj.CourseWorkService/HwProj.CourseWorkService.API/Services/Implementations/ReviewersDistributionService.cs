using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services.Implementations
{
	public class ReviewersDistributionService : IReviewersDistributionService
	{
		#region Constructors: Public

		public ReviewersDistributionService(ICourseWorksRepository courseWorksRepository,
			IUsersRepository usersRepository)
		{
			_courseWorksRepository = courseWorksRepository;
			_usersRepository = usersRepository;
		}

		#endregion

		#region Methods: Public

		public async Task<ReviewDistribution[]> GetOptimizedDistribution(string curatorId)
		{
			await InitData(curatorId).ConfigureAwait(false);
			SetMatrixForHungarianAlgorithm();
			return GetHungarianAlgorithmAnswer();
		}

		#endregion

		#region Fields: Private

		private readonly ICourseWorksRepository _courseWorksRepository;
		private readonly IUsersRepository _usersRepository;

		private CourseWork[] _courseWorks;
		private string[] _reviewers;
		private Dictionary<string, int> _reviewersCourseWorksCount;
		private int[,] _matrix;

		#endregion

		#region Methods: Private

		private async Task InitData(string curatorId)
		{
			_courseWorks = await _courseWorksRepository
				.FindAll(cw =>
					cw.IsCompleted == false && cw.CuratorProfileId == curatorId)
				.Include(cw => cw.Bids)
				.ToArrayAsync()
				.ConfigureAwait(false);
			_reviewers = (await _usersRepository.GetUserAsync(curatorId).ConfigureAwait(false))
				.CuratorProfile.ReviewersInCuratorsBidding
				.Select(e => e.ReviewerProfileId)
				.ToArray();
			_reviewersCourseWorksCount = new Dictionary<string, int>();
			foreach (var reviewerId in _reviewers)
			{
				var count = _courseWorksRepository
					.FindAll(cw => cw.ReviewerProfileId == reviewerId)
					.Count();
				_reviewersCourseWorksCount[reviewerId] = count;
			}
		}

		private void SetMatrixForHungarianAlgorithm()
		{
			var duplicateCount = _courseWorks.Length > _reviewers.Length
				? _courseWorks.Length / _reviewers.Length + 1
				: 1;
			_matrix = new int[_courseWorks.Length, _reviewers.Length * duplicateCount];

			for (var i = 0; i < _matrix.GetLength(0); i++)
			for (var k = 0; k < duplicateCount; k++)
			for (var j = 0; j < _matrix.GetLength(1); j++)
			{
				var bid = _courseWorks[i].Bids.FirstOrDefault(b => b.ReviewerProfileId == _reviewers[j]);
				var defaultValue = bid != null ? (int) bid.BiddingValue : 0;
				var valueWithCurrentCuratorCourseWorksCount = defaultValue - k;
				var valueWithBeforeCourseWorksCount = valueWithCurrentCuratorCourseWorksCount -
				                                      _reviewersCourseWorksCount[_reviewers[j]];
				_matrix[i, j] = valueWithBeforeCourseWorksCount * -1;
			}
		}

		private ReviewDistribution[] GetHungarianAlgorithmAnswer()
		{
			var executer = new HungarianAlgorithmExecuter(_matrix);
			var ans = executer.GetAnswer();
			var distribution = new ReviewDistribution[ans.Length];
			for (var i = 0; i < ans.Length; i++)
				distribution[i] = new ReviewDistribution(_courseWorks[i], _reviewers[ans[i]]);

			return distribution;
		}

		#endregion
	}

	public struct ReviewDistribution
	{
		public CourseWork CourseWork { get; set; }
		public string ReviewerId { get; set; }

		public ReviewDistribution(CourseWork courseWork, string reviewerId)
		{
			CourseWork = courseWork;
			ReviewerId = reviewerId;
		}
	}
}