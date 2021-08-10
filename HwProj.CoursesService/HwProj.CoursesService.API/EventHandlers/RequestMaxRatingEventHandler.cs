using System.Threading.Tasks;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.CoursesService.API.EventHandlers
{
    public class RequestMaxRatingEventHandler : IEventHandler<RequestMaxRatingEvent>
    {
        private readonly IEventBus _eventBus;
        private readonly ITasksRepository _tasksRepository;
        public RequestMaxRatingEventHandler(IEventBus eventBus, ITasksRepository tasksRepository)
        {
            _eventBus = eventBus;
            _tasksRepository = tasksRepository;
        }
        
        public async Task HandleAsync(RequestMaxRatingEvent @event)
        {
            var requiredTask = await _tasksRepository.GetAsync(@event.TaskId);
            _eventBus.Publish(new UpdateSolutionMaxRatingEvent(@event.TaskId, @event.SolutionId, requiredTask.MaxRating));
        }
    }
}
