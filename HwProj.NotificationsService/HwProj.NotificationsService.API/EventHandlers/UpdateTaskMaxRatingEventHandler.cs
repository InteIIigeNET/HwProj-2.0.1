using System;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;
using HwProj.Models.AuthService.DTO;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class UpdateTaskMaxRatingEventHandler : IEventHandler<UpdateTaskMaxRatingEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;
        private readonly IConfigurationSection _configuration;

        public UpdateTaskMaxRatingEventHandler(INotificationsRepository notificationRepository,
            INotificationsService notificationsService,
            IMapper mapper,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration
        )
        {
            _notificationsService = notificationsService;
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _authServiceClient = authServiceClient;
            _configuration = configuration.GetSection("Notification");
        }

        public async Task HandleAsync(UpdateTaskMaxRatingEvent @event)
        {
            foreach (var student in @event.Course.CourseMates)
            {
                var studentAccount = await _authServiceClient.GetAccountData(student.StudentId);
                var studentModel = _mapper.Map<AccountDataDto>(studentAccount);
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = $"Задача <a href='{_configuration["Url"]}task/{@event.Task.Id}'>{@event.Task.Title}</a>" +
                           $" из курса <a href='{_configuration["Url"]}courses/{@event.Course.Id}'>{@event.Course.Name}</a> обновлена.",
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