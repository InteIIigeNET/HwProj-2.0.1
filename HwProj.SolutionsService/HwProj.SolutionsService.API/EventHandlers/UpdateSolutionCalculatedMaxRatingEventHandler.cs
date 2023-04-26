using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.API.Events;
using HwProj.SolutionsService.API.Repositories;

namespace HwProj.SolutionsService.API.EventHandlers;

public class UpdateSolutionCalculatedMaxRatingEventHandler : EventHandlerBase<UpdateSolutionCalculatedMaxRatingEvent>
{
    private readonly ISolutionsRepository _solutionsRepository;
    
    public UpdateSolutionCalculatedMaxRatingEventHandler(ISolutionsRepository solutionsRepository)
    {
        _solutionsRepository = solutionsRepository;
    }
        
    public override async Task HandleAsync(UpdateSolutionCalculatedMaxRatingEvent @event)
    {
        await _solutionsRepository.ChangeSolutionCalculatedMaxRatingAsync(@event.SolutionId, @event.CalculatedRating);
    }
}