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
    public class LecturerRejectToCourseEventHandler : IEventHandler<LecturerRejectToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authClient;

        public LecturerRejectToCourseEventHandler(INotificationsRepository notificationRepository, IAuthServiceClient authClient, INotificationsService notificationsService)
        {
            _notificationRepository = notificationRepository;
            _authClient = authClient;
            _notificationsService = notificationsService;
        }

        public async Task HandleAsync(LecturerRejectToCourseEvent @event)
        {
            var notification = new Notification
            {
                Sender = "CourseService",
                Body = $"Вас не приняли на курс <a href='/courses/{@event.CourseId}'>{@event.CourseName}</a>.",
                Category = "CourseService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.StudentId
            };
            await _notificationRepository.AddAsync(notification);
            await _notificationsService.SendEmailAsync(notification, @event.student.Email);
        }
    }
}