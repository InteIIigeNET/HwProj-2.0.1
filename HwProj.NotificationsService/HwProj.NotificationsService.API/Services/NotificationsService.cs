using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.TelegramBotService.Client;
using Microsoft.Extensions.Configuration;
using MimeKit;
using Telegram.Bot;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.NotificationsService.API.Services
{
    public class NotificationsService : INotificationsService
    {
        private readonly INotificationsRepository _repository;
        private readonly IMapper _mapper;
        private readonly IConfigurationSection _configuration;
        private readonly IConfigurationSection _configurationMail;
        private readonly TelegramBotClient _botClient;
        private readonly ITelegramBotServiceClient _telegramBotServiceClient;
        private readonly MailKit.Net.Smtp.SmtpClient _client;

        public NotificationsService(INotificationsRepository repository, IMapper mapper, IConfiguration configuration, ITelegramBotServiceClient telegramBotServiceClient)
        {
            _repository = repository;
            _mapper = mapper;
            _configuration = configuration.GetSection("Telegram");
            _configurationMail = configuration.GetSection("Notification");
            _telegramBotServiceClient = telegramBotServiceClient;
            _botClient = new TelegramBotClient(_configuration["Token"]);
            _client = new MailKit.Net.Smtp.SmtpClient();
        }

        public async Task<long> AddNotificationAsync(Notification notification)
        {
            var id = await _repository.AddAsync(notification);
            return id;
        }

        public async Task<NotificationViewModel[]> GetAsync(string userId, NotificationFilter filter = null)
        {
            filter = filter ?? new NotificationFilter
            {
                MaxCount = 50, 
            };
            var notifications = await _repository.GetAllByUserAsync(userId, filter);
            return notifications.Select(notification => _mapper.Map<NotificationViewModel>(notification)).ToArray();
        }

        public async Task MarkAsSeenAsync(string userId, long[] notificationIds)
        {
            await _repository.UpdateBatchAsync(userId, notificationIds,
                t => new Notification {HasSeen = true});
        }
        
        public async Task SendEmailAsync(Notification notification, string email, string topic)
        {
            var emailMessage = new MimeMessage();

            emailMessage.From.Add(new MailboxAddress("HwProj-2.0.1", _configurationMail["Mail"]));
            emailMessage.To.Add(new MailboxAddress("", email));
            emailMessage.Subject = topic;
            emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html)
            {
                Text = notification.Body
            };

            await _client.ConnectAsync(_configurationMail["ConnectSite"], 465, true);
            await _client.AuthenticateAsync(_configurationMail["Mail"], _configurationMail["Password"]);
            await _client.SendAsync(emailMessage);

            await _client.DisconnectAsync(true);
        
        }

        public async Task SendTelegramMessageAsync(Notification notification)
        {
            var checkUser = await _telegramBotServiceClient.CheckUser(notification.Owner);
            if (checkUser)
            {
                var user = await _telegramBotServiceClient.GetTelegramUser(notification.Owner);
                await _botClient.SendTextMessageAsync(user, notification.Body, ParseMode.Markdown);
            }
        }

        public async Task SendTelegramMessageWithKeyboardAsync(Notification notification, InlineKeyboardMarkup inlineKeyboard)
        {
            var checkUser = await _telegramBotServiceClient.CheckUser(notification.Owner);
            if (checkUser)
            {
                var user = await _telegramBotServiceClient.GetTelegramUser(notification.Owner);
                await _botClient.SendTextMessageAsync(user, notification.Body, ParseMode.Markdown, replyMarkup:inlineKeyboard);
            }
        }
    }
}