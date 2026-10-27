using System;
using System.IO;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using MimeKit.Utils;

namespace HwProj.NotificationsService.API.Services
{
    public class EmailService : IEmailService
    {
        private const string SenderName = "HwProj";
        private const string LogoResourceName = "HwProj.NotificationsService.API.Resources.hw-cat.png";

        private static readonly Lazy<byte[]> Logo = new Lazy<byte[]>(LoadLogo);

        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(NotificationMessage message, string email, string recipientName = null)
        {
            var subject = $"{SenderName} · {message.Subject}";
            try
            {
                var configurationSection = _configuration.GetSection("Notification");
                var connectSite = configurationSection["ConnectSite"];
                var password = configurationSection["Password"];
                var serviceMail = configurationSection["Mail"];
                var siteUrl = configurationSection["Url"];

                var emailMessage = new MimeMessage
                {
                    From = { new MailboxAddress(SenderName, serviceMail) },
                    To = { new MailboxAddress("", email) },
                    Subject = subject,
                    Body = BuildBody(message, recipientName, siteUrl)
                };

                using var client = new MailKit.Net.Smtp.SmtpClient();
                await client.ConnectAsync(connectSite, 465, true);
                await client.AuthenticateAsync(serviceMail, password);

                _logger.LogInformation($"Sending email to {email} with topic {subject}");

                await client.SendAsync(emailMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error while sending email to {email} with topic {subject}");
            }
        }

        private static MimeEntity BuildBody(NotificationMessage message, string recipientName, string siteUrl)
        {
            var builder = new BodyBuilder
            {
                TextBody = EmailTemplate.RenderText(message, recipientName, siteUrl)
            };

            // Логотип вкладываем в письмо (cid:), а не ссылаемся на сайт: так шапка видна сразу,
            // даже если почтовый клиент по умолчанию блокирует внешние картинки
            var logo = builder.LinkedResources.Add("hw-cat.png", Logo.Value, new ContentType("image", "png"));
            logo.ContentId = MimeUtils.GenerateMessageId();

            builder.HtmlBody = EmailTemplate.RenderHtml(message, recipientName, siteUrl, $"cid:{logo.ContentId}");
            return builder.ToMessageBody();
        }

        private static byte[] LoadLogo()
        {
            using var stream = typeof(EmailService).Assembly.GetManifestResourceStream(LogoResourceName)
                               ?? throw new InvalidOperationException($"Resource {LogoResourceName} not found");
            using var memory = new MemoryStream();
            stream.CopyTo(memory);
            return memory.ToArray();
        }
    }
}
