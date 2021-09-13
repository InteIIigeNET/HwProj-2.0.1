using System;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.API.Events;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class InviteLecturerEventHandler : IEventHandler<InviteLecturerEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;

        public InviteLecturerEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService, IMapper mapper, IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _mapper = mapper;
            _authServiceClient = authServiceClient;
        }

        public async Task HandleAsync(InviteLecturerEvent @event)
        {
            var notification = new Notification
            {
                Sender = "AuthService",
                Body = "Вас добавили в список лекторов.",
                Category = "AuthService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.UserId
            };
            await _notificationRepository.AddAsync(notification);
            await _notificationsService.SendEmailAsync(notification, @event.Email, "HwProj");
        }
    }
}