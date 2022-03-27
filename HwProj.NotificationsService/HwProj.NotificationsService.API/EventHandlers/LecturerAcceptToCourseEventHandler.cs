using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class LecturerAcceptToCourseEventHandler : IEventHandler<LecturerAcceptToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;


        public LecturerAcceptToCourseEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService, IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _authServiceClient = authServiceClient;
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
            var student = await _authServiceClient.GetAccountData(notification.Owner);
            await _notificationsService.SendEmailAsync(notification, student.Email, "HwProj");
            
            notification.Body = $"Вас приняли на курс {@event.CourseName}.";
            await _notificationsService.SendTelegramMessageAsync(notification, null);
        }
    }
}