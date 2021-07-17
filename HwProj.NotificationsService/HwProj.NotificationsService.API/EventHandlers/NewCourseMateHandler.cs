using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationsService.API.Models;
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
            var notification = new Notification
            {
                Body = $"Студент {user.Name} {user.Surname} записался на курс {@event.CourseName}"
            };
        }
    }
}