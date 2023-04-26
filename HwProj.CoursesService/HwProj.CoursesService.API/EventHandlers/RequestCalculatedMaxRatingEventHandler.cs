using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.Models.NotificationsService;
using HwProj.SolutionsService.API.Events;

namespace HwProj.CoursesService.API.EventHandlers
{
    public class RequestCalculatedMaxRatingEventHandler : EventHandlerBase<RequestCalculatedMaxRatingEvent>
    {
        private readonly IDeadlinesRepository _deadlinesRepository;
        private readonly IEventBus _eventBus;

        public RequestCalculatedMaxRatingEventHandler(IDeadlinesRepository deadlinesRepository, IEventBus eventBus)
        {
            _deadlinesRepository = deadlinesRepository;
            _eventBus = eventBus;
        }
        
        public override async Task HandleAsync(RequestCalculatedMaxRatingEvent @event)
        {
            var deadlines = await _deadlinesRepository.GetTaskDeadlinesForStudent(@event.StudentId, @event.TaskId);
            var calculatedRating = @event.TaskMaxRating;
            var deadlinePenalties = deadlines.Where(deadline => deadline.DateTime < DateTimeUtils.GetMoscowNow())
                .Select(deadline => deadline.ToSubtract)
                .ToArray();

            foreach (var penalty in deadlinePenalties)
            {
                calculatedRating -= penalty;
            }
            
            _eventBus.Publish(new UpdateSolutionCalculatedMaxRatingEvent(
                @event.SolutionId,
                calculatedRating > 0 ? calculatedRating : 0
                )
            );
        }
    }
}
