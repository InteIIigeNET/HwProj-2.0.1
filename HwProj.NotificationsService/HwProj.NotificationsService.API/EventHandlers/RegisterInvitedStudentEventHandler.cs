using System;
using System.Threading.Tasks;
using System.Web;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class RegisterInvitedStudentEventHandler : EventHandlerBase<RegisterInvitedStudentEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly bool _isDevelopmentEnv;

        public RegisterInvitedStudentEventHandler(
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

        public override async Task HandleAsync(RegisterInvitedStudentEvent @event)
        {
            var frontendUrl = _configuration.GetSection("Notification")["Url"];
            var inviteLink = $"{frontendUrl}/join/{HttpUtility.UrlEncode(@event.AuthToken)}";

            var notification = new Notification
            {
                Sender = "AuthService",
                Body = $"{@event.Name} {@event.Surname}, вас пригласили в HwProj2.<br/><br/>" +
                       $"Для доступа к аккаунту перейдите по  <br/><a href='{inviteLink}'>ссылке</a><br/><br/>" +
                       "Если вы не ожидали этого приглашения, проигнорируйте это письмо.",
                Category = CategoryState.Profile,
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.UserId
            };

            if (_isDevelopmentEnv) Console.WriteLine(inviteLink);
            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, @event.Email, "HwProj - Приглашение");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}