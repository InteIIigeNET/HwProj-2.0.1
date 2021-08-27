using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.SolutionsService.API.Events;

namespace HwProj.NotificationsService.API.EventHandlers
{
    // ReSharper disable once UnusedType.Global
    public class StudentPassTaskEventHandler : IEventHandler<StudentPassTaskEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public StudentPassTaskEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task HandleAsync(StudentPassTaskEvent @event)
        {
            await _notificationRepository.AddAsync(new Notification
            {
                Sender = "CourseService",
                Body = $"Добавлено новое <a href={@event.Solution.GithubUrl}>решение</a> в курсе <a href='courses/{@event.Course.Id}'>{@event.Course.Name}</a>.",
                Category = "CourseService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.Course.MentorId
            }); ;
        }
    }
}