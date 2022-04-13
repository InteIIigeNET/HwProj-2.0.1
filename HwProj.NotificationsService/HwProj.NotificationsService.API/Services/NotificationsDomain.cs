using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;

namespace HwProj.NotificationsService.API.Services
{
    public class NotificationsDomain : INotificationsService
    {
        private readonly INotificationsRepository _repository;
        private readonly IMapper _mapper;

        public NotificationsDomain(INotificationsRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
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
    }
}