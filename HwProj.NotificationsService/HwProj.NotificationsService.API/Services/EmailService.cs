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
        private readonly IConfiguration _configuration;
        private readonly ILogger<Service> _logger;

        public EmailService(IConfiguration configuration, ILogger<Service> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(Notification notification, string email, string topic)
        {
            try
            {
                var configurationSection = _configuration.GetSection("Notification");
                var connectSite = configurationSection["ConnectSite"];
                var password = configurationSection["Password"];
                var serviceMail = configurationSection["Mail"];

                using var client = new MailKit.Net.Smtp.SmtpClient();
                await client.ConnectAsync(connectSite, 465, true);
                await client.AuthenticateAsync(serviceMail, password);

                var emailMessage = new MimeMessage
                {
                    From = { new MailboxAddress("HwProj-2.0.1", serviceMail) },
                    To = { new MailboxAddress("", email) },
                    Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = notification.Body },
                    Subject = topic
                };

                _logger.LogInformation($"Sending email to {email} with topic {topic}");

                await client.SendAsync(emailMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error while sending email to {email} with topic {topic}");
            }
        }
    }
}
