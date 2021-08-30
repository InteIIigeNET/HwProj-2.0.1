using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.SolutionsService.API.Events;

namespace HwProj.NotificationsService.API.EventHandlers
{
    // ReSharper disable once UnusedType.Global
    public class RateEventHandler : IEventHandler<RateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public RateEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task HandleAsync(RateEvent @event)
        {
            await _notificationRepository.AddAsync(new Notification
            {
                Sender = "SolutionService",
                Body = $"Задача <a href='task/{@event.Task.Id}' target='_blank'>{@event.Task.Title}</a> оценена.",
                Category = "SolutionService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.Solution.StudentId
            }); ;
        }
    }
}