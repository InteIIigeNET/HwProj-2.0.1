using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.SolutionsService.API.Events;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class StudentPassTaskEventHandler : IEventHandler<StudentPassTaskEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;


        public StudentPassTaskEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService, IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _authServiceClient = authServiceClient;
        }

        public async Task HandleAsync(StudentPassTaskEvent @event)
        {
            foreach (var m in @event.Course.MentorIds.Split('/'))
            {
                var notification = new Notification
                {
                    Sender = "SolutionService",
                    Body = $"{@event.Student.Name} {@event.Student.Surname} добавил(-a) новое " +
                           $"<a href='{@event.Solution.GithubUrl}' target='_blank'>решение</a> " +
                           $"задачи <a href='task/{@event.Task.Id}'>{@event.Task.Title}</a>" +
                           $" из курса <a href='courses/{@event.Course.Id}'>{@event.Course.Name}</a>.",
                    Category = "SolutionService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = m,
                };
                await _notificationRepository.AddAsync(notification);
                var mentor = await _authServiceClient.GetAccountData(notification.Owner);
                await _notificationsService.SendEmailAsync(notification, mentor.Email, "HwProj");
                
                notification.Body = $"{@event.Student.Name} {@event.Student.Surname} добавил новое решение задачи {@event.Task.Title} из курса {@event.Course.Name}.";
                await _notificationsService.SendTelegramMessageAsync(notification);
            }
        }
    }
}