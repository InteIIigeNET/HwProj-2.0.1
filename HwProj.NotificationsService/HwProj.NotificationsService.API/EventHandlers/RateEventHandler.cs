using System;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.API.Events;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.SolutionsService.API.Events;

namespace HwProj.NotificationsService.API.EventHandlers
{
    // ReSharper disable once UnusedType.Global
    public class RateEventHandler : IEventHandler<RateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;

        public RateEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService, IMapper mapper, IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _mapper = mapper;
            _authServiceClient = authServiceClient;
        }

        public async Task HandleAsync(RateEvent @event)
        {
            var notification = new Notification
            {
                Sender = "SolutionService",
                Body = $"Задача <a href='task/{@event.Task.Id}' target='_blank'>{@event.Task.Title}</a> оценена.",
                Category = "Оценки",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.Solution.StudentId
            };
            await _notificationRepository.AddAsync(notification);
            var studentModel = await _authServiceClient.GetAccountData(notification.Owner);
            await _notificationsService.SendEmailAsync(notification, studentModel.Email, "Оценка");
        }
    }
}