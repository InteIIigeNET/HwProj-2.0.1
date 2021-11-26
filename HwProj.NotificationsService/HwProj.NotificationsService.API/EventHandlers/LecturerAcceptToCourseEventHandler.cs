using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.TelegramBotService.Client;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class LecturerAcceptToCourseEventHandler : IEventHandler<LecturerAcceptToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authClient;
        private readonly INotificationsService _notificationsService;

        public LecturerAcceptToCourseEventHandler(INotificationsRepository notificationRepository, IAuthServiceClient authClient, INotificationsService notificationsService)
        {
            _notificationRepository = notificationRepository;
            _authClient = authClient;
            _notificationsService = notificationsService;
        }

        public async Task HandleAsync(LecturerAcceptToCourseEvent @event)
        {
            var notification = new Notification
            {
                Sender = "CourseService",
                Body = $"Вас приняли на курс <a href='/courses/{@event.CourseId}'>{@event.CourseName}</a>.",
                Category = "CourseService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.StudentId
            };
            await _notificationRepository.AddAsync(notification);
            notification.Body = $"Вас приняли на курс {@event.CourseName}.";
            await _notificationsService.SendTelegramMessageAsync(notification, null);
        }
    }
}