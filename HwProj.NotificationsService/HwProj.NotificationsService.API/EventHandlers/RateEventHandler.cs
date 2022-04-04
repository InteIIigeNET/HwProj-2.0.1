using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.SolutionsService.API.Events;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class RateEventHandler : IEventHandler<RateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;

        public RateEventHandler(INotificationsRepository notificationRepository,
            INotificationsService notificationsService,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration
        )
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _authServiceClient = authServiceClient;
            _configuration = configuration.GetSection("Notification");
        }

        public async Task HandleAsync(RateEvent @event)
        {
            var notification = new Notification
            {
                Sender = "SolutionService",
                Body = $"Задача <a href='{_configuration["Url"]}/task/{@event.Task.Id}' target='_blank'>{@event.Task.Title}</a> оценена.",
                Category = "SolutionService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.Solution.StudentId
            };
            
            var studentModel = await _authServiceClient.GetAccountData(notification.Owner);
            
            await _notificationRepository.AddAsync(notification);
            await _notificationsService.SendEmailAsync(notification, studentModel.Email, "Оценка");
        }
    }
}