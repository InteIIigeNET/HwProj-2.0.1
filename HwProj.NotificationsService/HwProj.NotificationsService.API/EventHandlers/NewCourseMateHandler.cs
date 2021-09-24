using System;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class NewCourseMateHandler : IEventHandler<NewCourseMateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;
        private readonly IConfigurationSection _configuration;

        public NewCourseMateHandler(INotificationsRepository notificationRepository,
            INotificationsService notificationsService,
            IMapper mapper,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration
        )
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _mapper = mapper;
            _authServiceClient = authServiceClient;
            _configuration = configuration.GetSection("Notification");
        }

        public async Task HandleAsync(NewCourseMateEvent @event)
        {
            var user = await _authServiceClient.GetAccountData(@event.StudentId);

            foreach (var m in @event.MentorIds.Split('/'))
            {
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = $"Пользователь <a href='{_configuration["Url"]}/profile/{@event.StudentId}'>{user.Name} {user.Surname}</a>" +
                           $" подал заявку на вступление в курс <a href='/courses/{@event.CourseId}'>{@event.CourseName}</a>.",
                    Category = "CourseService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = m
                };
               
                var mentor = await _authServiceClient.GetAccountData(notification.Owner);
                
                await _notificationRepository.AddAsync(notification);
                await _notificationsService.SendEmailAsync(notification, mentor.Email, "HwProj");
            }
        }
    }
}