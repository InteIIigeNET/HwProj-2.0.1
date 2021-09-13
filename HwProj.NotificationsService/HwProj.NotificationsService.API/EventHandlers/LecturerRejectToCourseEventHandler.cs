using System;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class LecturerRejectToCourseEventHandler : IEventHandler<LecturerRejectToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;

        public LecturerRejectToCourseEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService, IMapper mapper, IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _mapper = mapper;
            _authServiceClient = authServiceClient;
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
            var student = await _authServiceClient.GetAccountData(notification.Owner);
            await _notificationsService.SendEmailAsync(notification, student.Email, "HwProj");
        }
    }
}