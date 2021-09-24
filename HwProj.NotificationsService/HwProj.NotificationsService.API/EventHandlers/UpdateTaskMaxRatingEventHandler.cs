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
    public class UpdateTaskMaxRatingEventHandler : IEventHandler<UpdateTaskMaxRatingEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public UpdateTaskMaxRatingEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task HandleAsync(UpdateTaskMaxRatingEvent @event)
        {
            foreach (var student in @event.Course.CourseMates)
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    Sender = "CourseService",
                    Body = $"<a href='task/{@event.Task.Id}'>Задача</a> обновлена.",
                    Category = "CourseService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = student.StudentId
                });
            }
        }
    }
}