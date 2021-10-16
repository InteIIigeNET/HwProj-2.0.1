using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class NewCourseMateHandler : IEventHandler<NewCourseMateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authClient;

        public NewCourseMateHandler(INotificationsRepository notificationRepository, IAuthServiceClient authClient)
        {
            _notificationRepository = notificationRepository;
            _authClient = authClient;
        }

        public async Task HandleAsync(NewCourseMateEvent @event)
        {
            var user = await _authClient.GetAccountData(@event.StudentId);

            foreach (var m in @event.MentorIds.Split('/'))
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    Sender = "CourseService",
                    Body = $"Пользователь <a href='profile/{@event.StudentId}'>{user.Name} {user.Surname}</a> подал(-а) заявку на вступление в курс <a href='/courses/{@event.CourseId}'>{@event.CourseName}</a>.",
                    Category = "CourseService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = m
                });
            }
        }
    }
}