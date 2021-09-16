using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.EventHandlers
{
    public class RequestMaxRatingEventHandler : IEventHandler<RequestMaxRatingEvent>
    {
        private readonly IEventBus _eventBus;
        private readonly ITasksRepository _tasksRepository;
        private readonly IDeadlinesRepository _deadlinesRepository;
        public RequestMaxRatingEventHandler(IEventBus eventBus, ITasksRepository tasksRepository, IDeadlinesRepository deadlinesRepository)
        {
            _eventBus = eventBus;
            _tasksRepository = tasksRepository;
            _deadlinesRepository = deadlinesRepository;
        }
        
        public async Task HandleAsync(RequestMaxRatingEvent @event)
        {
            var requiredTask = await _tasksRepository.GetAsync(@event.TaskId);
            var toSubtract = 0;
            await _deadlinesRepository.FindAll(deadline =>
                    (@event.TaskId == deadline.TaskId) &&
                    (deadline.DateTime < @event.SolutionDate) &&
                    (deadline.AffectedStudentId == @event.StudentId || deadline.AffectedStudentId == null))
                .ForEachAsync(deadline => toSubtract += deadline.ToSubtract);
            _eventBus.Publish(new UpdateSolutionMaxRatingEvent(@event.TaskId, @event.SolutionId, requiredTask.MaxRating - toSubtract));
        }
    }
}
