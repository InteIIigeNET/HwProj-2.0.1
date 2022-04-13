using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace HwProj.NotificationsService.API.Services
{
    public class NotificationsDomain : INotificationsService
    {
        private readonly INotificationsRepository _repository;
        private readonly IMapper _mapper;
        private readonly IConfigurationSection _configuration;
        private readonly MailKit.Net.Smtp.SmtpClient _client;

        public NotificationsDomain(INotificationsRepository repository, IMapper mapper, IConfiguration configuration)
        {
            _repository = repository;
            _mapper = mapper;
            _configuration = configuration.GetSection("Notification");
            _client = new MailKit.Net.Smtp.SmtpClient();
            
        }

        public async Task<long> AddNotificationAsync(Notification notification)
        {
            var id = await _repository.AddAsync(notification);
            return id;
        }

        public CategorizedNotifications[] GroupAsync(Notification[] notifications)
        {
            var groupedNotifications = notifications.GroupBy(t => t.Category).Select(
                category => (category.Key,
                    category.Where(t => t.HasSeen).ToArray(),
                    category.Where(t => !t.HasSeen).ToArray()));

            //return groupedNotifications.Select(element => _mapper.Map<CategorizedNotifications>(element)).ToArray();
            return groupedNotifications.Select(element =>
                    new CategorizedNotifications(element.Key,
                        _mapper.Map<NotificationViewModel[]>(element.Item2),
                        _mapper.Map<NotificationViewModel[]>(element.Item3))
                ).ToArray();
        }

        public async Task MarkAsSeenAsync(string userId, long[] notificationIds)
        {
            await _repository.UpdateBatchAsync(userId, notificationIds,
                t => new Notification {HasSeen = true});
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

            using (_client)
            {
                await _client.ConnectAsync(_configuration["ConnectSite"], 465, true);
                await _client.AuthenticateAsync(_configuration["Mail"], _configuration["Password"]);
                await _client.SendAsync(emailMessage);
            }
        }
    }
}
