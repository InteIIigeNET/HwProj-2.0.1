using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;

namespace HwProj.CourseWorkService.API.Services
{
    public class BiddingService : EntityService<Bid>, IBiddingService
    {
        public BiddingService(IBidsRepository bidsRepository) : base(bidsRepository)
        {
        }
    }
}
