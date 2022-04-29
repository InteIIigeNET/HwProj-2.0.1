using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class LecturerAcceptToCourseEventHandler : IEventHandler<LecturerAcceptToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;
        
        public LecturerAcceptToCourseEventHandler(INotificationsRepository notificationRepository,
            INotificationsService notificationsService,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration, 
            IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _authServiceClient = authServiceClient;
            _emailService = emailService;
            _configuration = configuration.GetSection("Notification");
        }

        public async Task HandleAsync(LecturerAcceptToCourseEvent @event)
        {
            var notification = new Notification
            {
                Sender = "CourseService",
                Body = $"Вас приняли на курс <a href='{_configuration["Url"]}/courses/{@event.CourseId}'>{@event.CourseName}</a>.",
                Category = "CourseService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.StudentId
            };
            
            var student = await _authServiceClient.GetAccountData(notification.Owner);
           
            await _notificationRepository.AddAsync(notification);
            await _emailService.SendEmailAsync(notification, student.Email, "HwProj");
        }
    }
}