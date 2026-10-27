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
    public class RegisterEventHandler : EventHandlerBase<StudentRegisterEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly bool _isDevelopmentEnv;

        public RegisterEventHandler(
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

        public override async Task HandleAsync(StudentRegisterEvent @event)
        {
            var frontendUrl = _configuration.GetSection("Notification")["Url"];
            var recoveryLink =
                $"{frontendUrl}/resetPassword?token={HttpUtility.UrlEncode(@event.ChangePasswordToken)}&id={HttpUtility.UrlEncode(@event.UserId)}";

            // Ссылка с токеном смены пароля есть только в письме и в базу уведомлений не попадает
            var message = new NotificationMessage(CategoryState.Profile, "Добро пожаловать в HwProj!")
                .WithSubject("Подтверждение регистрации")
                .WithText("Вы зарегистрировались в HwProj — сервисе для сдачи и проверки домашних заданий.")
                .WithAction("Подтвердить профиль", recoveryLink,
                    hint: "Осталось подтвердить почту и придумать пароль — для этого нажмите на кнопку ниже.",
                    showUrl: true)
                .WithNote("Если вы не регистрировались в HwProj, просто проигнорируйте это письмо.");

            if (_isDevelopmentEnv) Console.WriteLine(recoveryLink);
            var addNotificationTask = _notificationRepository.AddAsync(message.ToNotification(@event.UserId, "AuthService"));
            var sendEmailTask = _emailService.SendEmailAsync(message, @event.Email,
                NotificationHtml.FullName(@event.Name, @event.Surname));

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
