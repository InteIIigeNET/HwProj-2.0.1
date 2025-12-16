using System;
using System.Threading.Tasks;
using System.Web;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.ViewModels;
using HwProj.NotificationService.Events.AuthService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
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
        private readonly IAuthServiceClient _authServiceClient;
        private const string _devPassword = "devPassword";

        public RegisterEventHandler(
            INotificationsRepository notificationRepository,
            IEmailService emailService,
            IConfiguration configuration,
            IHostingEnvironment env,
            IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _emailService = emailService;
            _configuration = configuration;
            _isDevelopmentEnv = env.IsDevelopment();
            _authServiceClient = authServiceClient;
        }

        public override async Task HandleAsync(StudentRegisterEvent @event)
        {
            var frontendUrl = _configuration.GetSection("Notification")["Url"];
            var recoveryLink =
                $"{frontendUrl}/resetPassword?token={HttpUtility.UrlEncode(@event.ChangePasswordToken)}&id={HttpUtility.UrlEncode(@event.UserId)}";

            if (_isDevelopmentEnv)
            {
                await HandleDevAsync(@event);
                Console.WriteLine(recoveryLink);
                return;
            }

            var notification = new Notification
            {
                Sender = "AuthService",
                Body = $"{@event.Name} {@event.Surname}, Добро Пожаловать в HwProj2.<br/><br/>" +
                       $"Для подтверждения почты и создания пароля перейдите по ссылке<br/><a href={recoveryLink}>Подтвердить профиль</a><br/><br/>" +
                       "Если вы не регистрировались в сервисе, проигнорируйте это письмо.",
                Category = CategoryState.Profile,
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.UserId
            };

            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, @event.Email, "HwProj");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }

        private async Task HandleDevAsync(StudentRegisterEvent @event)
        {
            var resetModel = new ResetPasswordViewModel
            {
                UserId = @event.UserId,
                Token = @event.ChangePasswordToken,
                Password = _devPassword,
                PasswordConfirm = _devPassword
            };

            var result = await _authServiceClient.ResetPassword(resetModel);

            if (result.Succeeded)
            {
                Console.WriteLine("Password changed");
            }
            else
            {
                Console.WriteLine("Password not changed");
            }
        }
    }
}
