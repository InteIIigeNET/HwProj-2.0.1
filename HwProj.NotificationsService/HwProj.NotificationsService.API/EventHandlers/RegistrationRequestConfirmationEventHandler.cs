using System;
using System.Threading.Tasks;
using System.Web;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class RegistrationRequestConfirmationEventHandler : EventHandlerBase<RegistrationRequestConfirmationEvent>
    {
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly bool _isDevelopmentEnv;

        public RegistrationRequestConfirmationEventHandler(
            IEmailService emailService,
            IConfiguration configuration,
            IHostingEnvironment env)
        {
            _emailService = emailService;
            _configuration = configuration;
            _isDevelopmentEnv = env.IsDevelopment();
        }

        public override async Task HandleAsync(RegistrationRequestConfirmationEvent @event)
        {
            var frontendUrl = _configuration.GetSection("Notification")["Url"];
            var confirmationLink =
                $"{frontendUrl}/registrationRequests/confirm?token={HttpUtility.UrlEncode(@event.Token)}";

            var email = new Notification
            {
                Sender = "CourseService",
                Body = $"{@event.Name} {@event.Surname}, для подачи заявки подтвердите адрес электронной почты.<br/><br/>" +
                       $"Перейдите по ссылке<br/><a href={confirmationLink}>Подтвердить почту</a><br/><br/>" +
                       "Если вы не отправляли заявку, проигнорируйте это письмо.",
                Category = CategoryState.Profile,
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = string.Empty
            };

            if (_isDevelopmentEnv) Console.WriteLine(confirmationLink);

            await _emailService.SendEmailAsync(email, @event.Email, "HwProj");
        }
    }
}
