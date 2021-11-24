using System;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class NewHomeworkEventHandler : IEventHandler<NewHomeworkEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;

        public NewHomeworkEventHandler(INotificationsRepository notificationRepository,
            INotificationsService notificationsService)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
        }

        public async Task HandleAsync(NewHomeworkEvent @event)
        {
            foreach (var student in @event.Course.CourseMates)
            {
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body =
                        $"В курсе <a href='courses/{@event.Course.Id}'>{@event.Course.Name}</a> опубликована новая домашка <i>{@event.Homework}</i>.",
                    Category = "CourseService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = student.StudentId
                };
                await _notificationRepository.AddAsync(notification);
                await _notificationsService.SendTelegramMessageAsync(notification);
            }
        }
    }
}