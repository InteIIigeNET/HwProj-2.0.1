﻿using System.Threading.Tasks;
using HwProj.Models.Events.AuthEvents;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class RegisterEventHandler : EventHandlerBase<StudentRegisterEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IEmailService _emailService;

        public RegisterEventHandler(INotificationsRepository notificationRepository, IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _emailService = emailService;
        }

        public override async Task HandleAsync(StudentRegisterEvent @event)
        {
            var notification = new Notification
            {
                Sender = "AuthService",
                Body = $"{@event.Name} {@event.Surname}, Добро Пожаловать в HwProj2.",
                Category = CategoryState.Profile,
                Date = DateTimeUtils.GetMoscowNow(),
                HasSeen = false,
                Owner = @event.UserId
            };

            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, @event.Email, "HwProj");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
