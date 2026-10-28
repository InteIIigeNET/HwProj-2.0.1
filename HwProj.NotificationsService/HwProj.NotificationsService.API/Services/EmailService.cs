using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Services.Digest;
using HwProj.NotificationsService.API.Services.Messages;
using MailKit.Net.Smtp;
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

        private IConfigurationSection Settings => _configuration.GetSection("Notification");

        public async Task SendEmailAsync(NotificationMessage message, string email, string recipientName = null)
        {
            var subject = $"{SenderName} · {message.Subject}";
            try
            {
                var siteUrl = Settings["Url"];
                var emailMessage = CreateMessage(email, subject,
                    EmailTemplate.RenderText(message, recipientName, siteUrl),
                    logoSrc => EmailTemplate.RenderHtml(message, recipientName, siteUrl, logoSrc));

                using var client = await ConnectAsync();

                _logger.LogInformation($"Sending email to {email} with topic {subject}");

                await client.SendAsync(emailMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error while sending email to {email} with topic {subject}");
            }
        }

        public async Task<IReadOnlyList<DigestEmail>> SendDigestsAsync(IReadOnlyList<DigestEmail> digests,
            CancellationToken cancellationToken)
        {
            var sent = new List<DigestEmail>();
            var siteUrl = Settings["Url"];
            SmtpClient client = null;

            try
            {
                foreach (var digest in digests)
                {
                    // Проверяем отмену только между письмами: если прервать отправку на середине,
                    // непонятно, дошло ли письмо, и завтра оно может прийти повторно
                    if (cancellationToken.IsCancellationRequested) break;

                    if (client == null)
                    {
                        try
                        {
                            client = await ConnectAsync();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error while connecting to SMTP server to send digests");
                            break;
                        }
                    }

                    var subject = $"{SenderName} · {digest.Message.Subject}";
                    try
                    {
                        var emailMessage = CreateMessage(digest.Email, subject,
                            DigestTemplate.RenderText(digest.Message, digest.RecipientName, siteUrl),
                            logoSrc => DigestTemplate.RenderHtml(digest.Message, digest.RecipientName, siteUrl, logoSrc));
                        // Письмо автоматическое: на него не должны срабатывать автоответчики (RFC 3834)
                        emailMessage.Headers.Add("Auto-Submitted", "auto-generated");

                        _logger.LogInformation($"Sending digest to {digest.Email} with topic {subject}");

                        await client.SendAsync(emailMessage);
                        sent.Add(digest);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error while sending digest to {digest.Email} with topic {subject}");

                        // После сетевой ошибки соединение закрыто — для следующего письма подключимся заново
                        if (!client.IsConnected)
                        {
                            client.Dispose();
                            client = null;
                        }
                    }
                }
            }
            finally
            {
                if (client != null) await DisconnectAsync(client);
            }

            return sent;
        }

        private async Task<SmtpClient> ConnectAsync()
        {
            var client = new SmtpClient();
            try
            {
                await client.ConnectAsync(Settings["ConnectSite"], 465, true);
                await client.AuthenticateAsync(Settings["Mail"], Settings["Password"]);
                return client;
            }
            catch
            {
                client.Dispose();
                throw;
            }
        }

        private async Task DisconnectAsync(SmtpClient client)
        {
            try
            {
                if (client.IsConnected) await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error while disconnecting from SMTP server");
            }
            finally
            {
                client.Dispose();
            }
        }

        private MimeMessage CreateMessage(string email, string subject, string textBody, Func<string, string> renderHtml)
        {
            var builder = new BodyBuilder { TextBody = textBody };

            // Логотип вкладываем в письмо (cid:), а не ссылаемся на сайт: так шапка видна сразу,
            // даже если почтовый клиент по умолчанию блокирует внешние картинки
            var logo = builder.LinkedResources.Add("hw-cat.png", Logo.Value, new ContentType("image", "png"));
            logo.ContentId = MimeUtils.GenerateMessageId();

            builder.HtmlBody = renderHtml($"cid:{logo.ContentId}");

            return new MimeMessage
            {
                From = { new MailboxAddress(SenderName, Settings["Mail"]) },
                To = { new MailboxAddress("", email) },
                Subject = subject,
                Body = builder.ToMessageBody()
            };
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
