using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;
using HwProj.NotificationsService.API.Services;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.Models.AuthService.DTO;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    // ReSharper disable once UnusedType.Global
    public class NewHomeworkEventHandler : IEventHandler<NewHomeworkEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;
        private readonly IConfigurationSection _configuration;

        public NewHomeworkEventHandler(INotificationsRepository notificationRepository,
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

        public async Task HandleAsync(NewHomeworkEvent @event)
        {
            foreach(var student in @event.Course.CourseMates)
            {
                var studentAccount = await _authServiceClient.GetAccountData(student.StudentId);
                var studentModel = _mapper.Map<AccountDataDto>(studentAccount);
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = $"В курсе <a href='{_configuration["Url"]}/courses/{@event.Course.Id}'>{@event.Course.Name}</a> опубликована новая домашняя работа <i>{@event.Homework}</i>.",
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