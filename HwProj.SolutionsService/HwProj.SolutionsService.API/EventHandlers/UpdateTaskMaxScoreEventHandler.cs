using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.SolutionsService.API.Events;
using HwProj.SolutionsService.API.Repositories;


namespace HwProj.SolutionsService.API.EventHandlers
{
    public class UpdateTaskMaxScoreEventHandler : IEventHandler<UpdateTaskMaxRatingEvent>
    {
        private readonly ISolutionsRepository _solutionsRepository;

        public UpdateTaskMaxScoreEventHandler(ISolutionsRepository solutionsRepository)
        {
            _solutionsRepository = solutionsRepository;
        }
        
        public async Task HandleAsync(UpdateTaskMaxRatingEvent @event)
        {
            await _solutionsRepository.ChangeTaskSolutionsMaxRatingAsync(@event.TaskId, @event.MaxRating);
        }
    }
}
