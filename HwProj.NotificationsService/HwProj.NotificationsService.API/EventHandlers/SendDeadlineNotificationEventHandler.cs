using System;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.SolutionsService.API.Events;
namespace HwProj.NotificationsService.API.EventHandlers
{
    public class SendDeadlineNotificationEventHandler : EventHandlerBase<DeadlineNotificationEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public SendDeadlineNotificationEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }
        
        public override async Task HandleAsync(DeadlineNotificationEvent @event)
        {
            string toBody = @event.DaysFromExpiration == TimeSpan.Zero
                ? $"Дедлайн по <a href='/tasks/get/{@event.TaskId}'>данному заданию</a> прошёл"
                : $"До дедлайна по <a href='/tasks/get/{@event.TaskId}'>данному заданию</a> осталось {@event.DaysFromExpiration.Days.ToString()} дней";

            foreach (var affectedStudent in @event.AffectedStudents)
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    Sender = "DeadlinesService",
                    Body = toBody,
                    Category = CategoryState.Homeworks,
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = affectedStudent
                });
            }
        }
    }
}
