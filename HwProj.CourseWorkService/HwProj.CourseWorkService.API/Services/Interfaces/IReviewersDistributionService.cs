using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Services.Implementations;

namespace HwProj.CourseWorkService.API.Services.Interfaces
{
	public interface IReviewersDistributionService
	{
		Task<ReviewDistribution[]> GetOptimizedDistribution(string curatorId);
	}
}
