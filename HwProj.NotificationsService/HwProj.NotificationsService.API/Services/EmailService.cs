using System;
using System.Threading.Tasks;
using Autofac.Core;
using HwProj.Models.NotificationsService;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace HwProj.NotificationsService.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly MailKit.Net.Smtp.SmtpClient _client;
        private readonly ILogger<Service> _logger;
        private readonly string _serviceMail;

        public EmailService(IConfiguration configuration, ILogger<Service> logger)
        {
            _logger = logger;

            var configurationSection = configuration.GetSection("Notification");
            var connectSite = configurationSection["ConnectSite"];
            var password = configurationSection["Password"];
            _serviceMail = configurationSection["Mail"];

            _client = new MailKit.Net.Smtp.SmtpClient();
            _client.Connect(connectSite, 465, true);
            _client.Authenticate(_serviceMail, password);
        }

        public async Task SendEmailAsync(Notification notification, string email, string topic)
        {
            var emailMessage = new MimeMessage
            {
                From = { new MailboxAddress("HwProj-2.0.1", _serviceMail) },
                To = { new MailboxAddress("", email) },
                Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = notification.Body },
                Subject = topic
            };

            _logger.LogInformation($"Sending email to {email} with topic {topic}");

            try
            {
                await _client.SendAsync(emailMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error while sending email to {email} with topic {topic}");
            }
        }
    }
}
