using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class LecturerRejectToCourseEventHandler : IEventHandler<LecturerRejectToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authClient;

        public LecturerRejectToCourseEventHandler(INotificationsRepository notificationRepository, IAuthServiceClient authClient)
        {
            _notificationRepository = notificationRepository;
            _authClient = authClient;
        }

        public async Task HandleAsync(LecturerRejectToCourseEvent @event)
        {
            await _notificationRepository.AddAsync(new Notification
            {
                Sender = "CourseService",
                Body = $"Вас не приняли на курс <a href='/courses/{@event.CourseId}'>{@event.CourseName}</a>.",
                Category = "CourseService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.StudentId
            });
        }
    }
}