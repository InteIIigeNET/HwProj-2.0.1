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
    public class EditProfileEventHandler : IEventHandler<EditProfileEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;

        
        public EditProfileEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService, IMapper mapper, IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _mapper = mapper;
            _authServiceClient = authServiceClient;
        }

        public async Task HandleAsync(EditProfileEvent @event)
        {
            var notification = new Notification
            {
                Sender = "AuthService",
                Body = "Ваш профиль был успешно отредактирован.",
                Category = "AuthService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.UserId
            };
            await _notificationRepository.AddAsync(notification);
            var studentAccount = await _authServiceClient.GetAccountData(notification.Owner);
            var studentModel = _mapper.Map<AccountDataDto>(studentAccount);
            
            await _notificationsService.SendEmailAsync(notification, studentModel.Email, "Редактирование профиля");
            await _notificationsService.SendTelegramMessageAsync(notification, null);
        }
    }
}