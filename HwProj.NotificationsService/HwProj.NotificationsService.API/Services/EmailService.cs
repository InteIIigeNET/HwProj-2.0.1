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
        private readonly IConfigurationSection _configuration;
        private readonly MailKit.Net.Smtp.SmtpClient _client;
        private readonly ILogger<Service> _logger;
        private readonly int _number;
        
        public EmailService(IConfiguration configuration, ILogger<Service> logger)
        {
            _logger = logger;
            _configuration = configuration.GetSection("Notification");
            _client = new MailKit.Net.Smtp.SmtpClient();
            _client.Connect(_configuration["ConnectSite"], 465, true);
            _client.Authenticate(_configuration["Mail"], _configuration["Password"]);
            _number = new Random().Next(1000);
        }
        
        public async Task SendEmailAsync(Notification notification, string email, string topic)
        {
            var emailMessage = new MimeMessage();

            emailMessage.From.Add(new MailboxAddress("HwProj-2.0.1", _configuration["Mail"]));
            emailMessage.To.Add(new MailboxAddress("", email));
            emailMessage.Subject = topic;
            emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html)
            {
                Text = notification.Body
            };
            
            await _client.SendAsync(emailMessage);
            _logger.LogInformation($"\n\n\n{_number}\n\n\n");
        }
    }
}