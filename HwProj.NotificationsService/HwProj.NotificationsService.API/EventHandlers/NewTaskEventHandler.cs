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
    public class NewTaskEventHandler : IEventHandler<NewTaskEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public NewTaskEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task HandleAsync(NewTaskEvent @event)
        {
            foreach(var student in @event.Course.CourseMates)
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    Sender = "SolutionService",
                    Body = $"В курсе <a href='courses/{@event.Course.Id}'>{@event.Course.Name}</a> задача {@event.Homework} опубликована.",
                    Category = "SolutionService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = student.StudentId
                });
            }
        }
    }
}