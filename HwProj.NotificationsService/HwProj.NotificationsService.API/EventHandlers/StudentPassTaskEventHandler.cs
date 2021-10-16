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
            foreach (var m in @event.Course.MentorIds.Split('/'))
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    Sender = "SolutionService",
                    Body = $"{@event.Student.Name} {@event.Student.Surname} добавил(-а) новое <a href='{@event.Solution.GithubUrl}' target='_blank'>решение</a> задачи <a href='task/{@event.Task.Id}'>{@event.Task.Title}</a> из курса <a href='courses/{@event.Course.Id}'>{@event.Course.Name}</a>.",
                    Category = "SolutionService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = m,
                });
            }
        }
    }
}