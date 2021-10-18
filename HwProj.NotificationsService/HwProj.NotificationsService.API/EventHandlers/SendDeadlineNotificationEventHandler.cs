using System;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.SolutionsService.API.Events;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class SendDeadlineNotificationEventHandler : IEventHandler<DeadlineNotificationEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public SendDeadlineNotificationEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }
        
        public async Task HandleAsync(DeadlineNotificationEvent @event)
        {
            string toBody = @event.DaysFromExpiration != TimeSpan.Zero
                ? $"Дедлайн по <a href='/tasks/get/{@event.TaskId}'>данному заданию</a> прошёл"
                : $"До дедлайна по <a href='/tasks/get/{@event.TaskId}'>данному заданию</a> осталось {@event.DaysFromExpiration.Days.ToString()} дней";
            string toCategory = @event.DaysFromExpiration == TimeSpan.Zero
                ? "Deadline expired"
                : $"Deadline expires in {@event.DaysFromExpiration.Days.ToString()} days";

            foreach (var affectedStudent in @event.AffectedStudents)
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    Sender = "DeadlinesService",
                    Body = toBody,
                    Category = toCategory,
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = affectedStudent
                });
            }
        }
    }
}
