using System.Threading.Tasks;
using HwProj.EventBus.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.SolutionsService.API.Events;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Repositories;

namespace HwProj.SolutionsService.API.EventHandlers
{
    public class UpdateSolutionMaxRatingEventHandler : IEventHandler<UpdateSolutionMaxRatingEvent>
    {
        private readonly ISolutionsRepository _solutionsRepository;

        public UpdateSolutionMaxRatingEventHandler(ISolutionsRepository solutionsRepository)
        {
            _solutionsRepository = solutionsRepository;
        }
        
        public async Task HandleAsync(UpdateSolutionMaxRatingEvent @event)
        {
            await _solutionsRepository.ChangeSolutionMaxRatingAsync(@event.SolutionId, @event.MaxRating);
        }
    }
}
