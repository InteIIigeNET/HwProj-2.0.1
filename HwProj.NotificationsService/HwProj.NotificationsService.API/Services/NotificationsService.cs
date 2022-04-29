using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace HwProj.NotificationsService.API.Services
{
    public class NotificationsService : INotificationsService
    {
        private readonly INotificationsRepository _repository;
        private readonly IMapper _mapper;
        private readonly IConfigurationSection _configuration;
        private readonly MailKit.Net.Smtp.SmtpClient _client;

        public NotificationsService(INotificationsRepository repository, IMapper mapper, IConfiguration configuration)
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