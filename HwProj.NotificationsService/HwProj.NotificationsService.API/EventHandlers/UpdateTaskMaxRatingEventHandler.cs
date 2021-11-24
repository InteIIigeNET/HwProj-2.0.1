using System;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class UpdateTaskMaxRatingEventHandler : IEventHandler<UpdateTaskMaxRatingEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;

        public UpdateTaskMaxRatingEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
        }

        public async Task HandleAsync(UpdateTaskMaxRatingEvent @event)
        {
            foreach (var student in @event.Course.CourseMates)
            {
                var notification =new Notification
                {
                    Sender = "CourseService",
                    Body = $"<a href='task/{@event.Task.Id}'>Задача</a> обновлена.",
                    Category = "CourseService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = student.StudentId
                };
                await _notificationRepository.AddAsync(notification);
                await _notificationsService.SendTelegramMessageAsync(notification);
            }
        }
    }
}