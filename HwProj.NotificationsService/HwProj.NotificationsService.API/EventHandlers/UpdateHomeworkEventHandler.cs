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
    public class UpdateHomeworkEventHandler : IEventHandler<UpdateHomeworkEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public UpdateHomeworkEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task HandleAsync(UpdateHomeworkEvent @event)
        {
            foreach (var student in @event.Course.CourseMates)
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    Sender = "CourseService",
                    Body = $"В курсе <a href='courses/{@event.Course.Id}'>{@event.Course.Name}</a> домашнее задание <i>{@event.Homework.Title}</i> обновлено.",
                    Category = "CourseService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = student.StudentId
                });
            }
        }
    }
}