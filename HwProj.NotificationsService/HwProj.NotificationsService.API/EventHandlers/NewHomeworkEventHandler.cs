using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;

namespace HwProj.NotificationsService.API.EventHandlers
{
    // ReSharper disable once UnusedType.Global
    public class NewHomeworkEventHandler : IEventHandler<NewHomeworkEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public NewHomeworkEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task HandleAsync(NewHomeworkEvent @event)
        {
            foreach(var student in @event.Course.CourseMates)
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    Sender = "CourseService",
                    Body = $"В курсе <a href='courses/{@event.Course.Id}'>{@event.Course.Name}</a> опубликована новая домашка <i>{@event.Homework}</i>.",
                    Category = "CourseService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = student.StudentId
                });
            }
        }
    }
}