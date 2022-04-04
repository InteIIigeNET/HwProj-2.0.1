using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class UpdateHomeworkEventHandler : IEventHandler<UpdateHomeworkEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;

        public UpdateHomeworkEventHandler(INotificationsRepository notificationRepository,
            INotificationsService notificationsService,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration
        )
        {
            _notificationsService = notificationsService;
            _notificationRepository = notificationRepository;
            _authServiceClient = authServiceClient;
            _configuration = configuration.GetSection("Notification");
        }

        public async Task HandleAsync(UpdateHomeworkEvent @event)
        {
            foreach (var student in @event.Course.CourseMates)
            {
                var studentModel = await _authServiceClient.GetAccountData(student.StudentId);
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = $"В курсе <a href='{_configuration["Url"]}/courses/{@event.Course.Id}'>{@event.Course.Name}</a> домашнее задание <i>{@event.Homework.Title}</i> обновлено.",
                    Category = "CourseService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = student.StudentId
                };
                
                await _notificationRepository.AddAsync(notification);
                await _notificationsService.SendEmailAsync(notification, studentModel.Email, "Домашняя работа");
            }
        }
    }
}