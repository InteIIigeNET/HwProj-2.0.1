using System;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.TelegramBotService.API.Events;

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
            var notification = new Notification
            {
                Sender = "TelegramBotService",
                Body = $"Ваш код для телеграмма - {@event.Code}.",
                Category = "TelegramBotService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.StudentId
            };
            await _notificationRepository.AddAsync(notification);
        }
    }
}