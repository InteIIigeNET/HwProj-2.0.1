using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.SolutionsService.API.Events;

namespace HwProj.NotificationsService.API.EventHandlers
{
    // ReSharper disable once UnusedType.Global
    public class StudentPassTaskEventHandler : IEventHandler<StudentPassTaskEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;

        public StudentPassTaskEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
        }

        public async Task HandleAsync(StudentPassTaskEvent @event)
        {
            var notification = new Notification
            {
                Sender = "SolutionService",
                Body = $"{@event.Student.Name} {@event.Student.Surname} добавил новое <a href='{@event.Solution.GithubUrl}' target='_blank'>решение</a> задачи <a href='task/{@event.Task.Id}'>{@event.Task.Title}</a> из курса <a href='courses/{@event.Course.Id}'>{@event.Course.Name}</a>.",
                Category = "SolutionService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.Course.MentorId
            };
            await _notificationRepository.AddAsync(notification);
            await _notificationsService.SendEmailAsync(notification, notification.Owner);
        }
    }
}