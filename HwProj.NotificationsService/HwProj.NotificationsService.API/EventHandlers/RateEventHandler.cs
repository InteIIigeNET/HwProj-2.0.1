using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.SolutionsService.API.Events;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class RateEventHandler : IEventHandler<RateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;


        public RateEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService, IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _authServiceClient = authServiceClient;
        }

        public async Task HandleAsync(RateEvent @event)
        {
            var notification = new Notification
            {
                Sender = "SolutionService",
                Body = $"Задача <a href='task/{@event.Task.Id}' target='_blank'>{@event.Task.Title}</a> оценена.",
                Category = "SolutionService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.Solution.StudentId
            };
            await _notificationRepository.AddAsync(notification);
            var studentModel = await _authServiceClient.GetAccountData(notification.Owner);
            await _notificationsService.SendEmailAsync(notification, studentModel.Email, "Оценка");
            
            notification.Body = $"Задача {@event.Task.Title} оценена."; 
            var inlineKeyboard = new InlineKeyboardMarkup(new InlineKeyboardButton
            {
                Text = $"{@event.Task.Title}",
                CallbackData = $"/solutioninfo {@event.SolutionId}"
            });
            await _notificationsService.SendTelegramMessageAsync(notification, inlineKeyboard);
        }
    }
}