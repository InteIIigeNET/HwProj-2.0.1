using System;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.HomeworkService.API.Events;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.HomeworkService.API.EventHandlers
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
