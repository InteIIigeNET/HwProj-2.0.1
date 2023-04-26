using System.Linq;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.API.Events;
using HwProj.SolutionsService.API.Repositories;

namespace HwProj.SolutionsService.API.EventHandlers
{
    public class ClearCompletedEventHandler : EventHandlerBase<ClearCompletedEvent>
    {
        private readonly ISolutionsRepository _solutionsRepository;
        private readonly IEventBus _eventBus;

        public ClearCompletedEventHandler(ISolutionsRepository solutionsRepository, IEventBus eventBus)
        {
            _solutionsRepository = solutionsRepository;
            _eventBus = eventBus;
        }
        
        public override async Task HandleAsync(ClearCompletedEvent @event)
        {
            var studentsWithFinalSolutions = _solutionsRepository.FindAll(s => @event.TaskId == s.TaskId
                                                                               && s.State == SolutionState.Final).Select(s => s.StudentId);
            var studentsToNotify = @event.AffectedStudents.Except(studentsWithFinalSolutions).ToList();
            _eventBus.Publish(new DeadlineNotificationEvent(@event.TaskId, studentsToNotify, @event.DaysFromExpiration));
        }
    }
}