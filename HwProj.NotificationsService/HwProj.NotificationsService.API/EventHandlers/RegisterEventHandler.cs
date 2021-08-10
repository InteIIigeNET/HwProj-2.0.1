using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;

namespace HwProj.NotificationsService.API.EventHandlers
{
    // ReSharper disable once UnusedType.Global
    public class RegisterEventHandler : IEventHandler<StudentRegisterEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public RegisterEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task HandleAsync(StudentRegisterEvent @event)
        {
            await _notificationRepository.AddAsync(new Notification
            {
                Sender = "AuthService",
                Body = $"{@event.Name} {@event.Surname}, Добро Пожаловать в HwProj2.",
                Category = "AuthService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.UserId
            });

            await _notificationRepository.AddAsync(new Notification
            {
                Sender = "AuthService",
                Body = $"Новый пользователь {@event.Name} {@event.Surname} зарегистрирован. Email: {@event.Email}. UserId: {@event.UserId}",
                Category = "AuthService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = "b26fa7ef-401d-45e0-a0f0-9e656b2bc16d" // Admin (admin@gmail.com) UserId
            });
        }
    }
}