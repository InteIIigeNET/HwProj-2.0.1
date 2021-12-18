using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class NewCourseMateHandler : IEventHandler<NewCourseMateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authClient;
        private readonly INotificationsService _notificationsService;


        public NewCourseMateHandler(INotificationsRepository notificationRepository, IAuthServiceClient authClient, INotificationsService notificationsService)
        {
            _notificationRepository = notificationRepository;
            _authClient = authClient;
            _notificationsService = notificationsService;
        }

        public async Task HandleAsync(NewCourseMateEvent @event)
        {
            var user = await _authClient.GetAccountData(@event.StudentId);

            foreach (var m in @event.MentorIds.Split('/'))
            {
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body =
                        $"Пользователь <a href='profile/{@event.StudentId}'>{user.Name} {user.Surname}</a>" +
                        $" подал заявку на вступление в курс <a href='/courses/{@event.CourseId}'>{@event.CourseName}</a>.",
                    Category = "CourseService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = m
                };
                await _notificationRepository.AddAsync(notification);
                var mentor = await _authClient.GetAccountData(notification.Owner);
                await _notificationsService.SendEmailAsync(notification, mentor.Email, "HwProj");
                
                notification.Body = $"Пользователь {user.Name} {user.Surname} подал заявку на вступление в курс {@event.CourseName}.";
                await _notificationsService.SendTelegramMessageAsync(notification, null);
            }
        }
    }
}