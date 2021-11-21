using System;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.TelegramBotAPI;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class ConfirmTelegramBotEventHandler: IEventHandler<ConfirmTelegramBotEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public ConfirmTelegramBotEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task HandleAsync(ConfirmTelegramBotEvent @event)
        {
            /*await _notificationRepository.AddAsync(new Notification
            {
                Sender = "TelegramBot",
                Body = "Ваш профиль был успешно отредактирован.",
                Category = "AuthService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.UserId
            });*/
        }
    }
}