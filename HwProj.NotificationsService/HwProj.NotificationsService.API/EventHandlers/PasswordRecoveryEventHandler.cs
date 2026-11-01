using System;
using System.Threading.Tasks;
using System.Web;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.AuthService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class PasswordRecoveryEventHandler : IEventHandler<PasswordRecoveryEvent>
    {
        private readonly IConfiguration _configuration;
        private readonly INotificationsRepository _notificationRepository;
        private readonly IEmailService _emailService;
        private readonly bool _isDevelopmentEnv;

        public PasswordRecoveryEventHandler(
            INotificationsRepository notificationRepository,
            IEmailService emailService,
            IConfiguration configuration,
            IHostingEnvironment env)
        {
            _notificationRepository = notificationRepository;
            _emailService = emailService;
            _configuration = configuration;
            _isDevelopmentEnv = env.IsDevelopment();
        }

        public async Task HandleAsync(PasswordRecoveryEvent @event)
        {
            var frontendUrl = _configuration.GetSection("Notification")["Url"];
            var recoveryLink =
                $"{frontendUrl}/resetPassword?token={HttpUtility.UrlEncode(@event.Token)}&id={HttpUtility.UrlEncode(@event.UserId)}";

            // Ссылка со сбросом пароля есть только в письме: в ленте уведомлений остаётся лишь факт запроса
            var message = new NotificationMessage(CategoryState.Profile, "Сброс пароля")
                .WithText("Для вашего аккаунта был запрошен сброс пароля.")
                .WithAction("Сменить пароль", recoveryLink,
                    hint: "Чтобы задать новый пароль, нажмите на кнопку ниже.", showUrl: true)
                .WithNote("Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо — " +
                          "пароль останется прежним.");

            if (_isDevelopmentEnv) Console.WriteLine(recoveryLink);
            var addNotificationTask = _notificationRepository.AddAsync(message.ToNotification(@event.UserId, "AuthService"));
            var sendEmailTask = _emailService.SendEmailAsync(message, @event.Email,
                NotificationHtml.FullName(@event.Name, @event.Surname));

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
