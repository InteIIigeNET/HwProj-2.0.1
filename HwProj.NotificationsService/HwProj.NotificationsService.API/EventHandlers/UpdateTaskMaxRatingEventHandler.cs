using System;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;
using HwProj.NotificationsService.API.Services;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class UpdateTaskMaxRatingEventHandler : IEventHandler<UpdateTaskMaxRatingEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;

        public UpdateTaskMaxRatingEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
        }

        public async Task HandleAsync(UpdateTaskMaxRatingEvent @event)
        {
            foreach (var student in @event.Course.CourseMates)
            {
                var notification =new Notification
                {
                    Sender = "CourseService",
                    Body = $"<a href='task/{@event.Task.Id}'>Задача</a> из {@event.Course.Name} обновлена.",
                    Category = "CourseService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = student.StudentId
                };
                await _notificationRepository.AddAsync(notification);
                notification.Body = $"Задача {@event.Task.Title} из {@event.Course.Name} обновлена.";// клава
                var inlineKeyboard = new InlineKeyboardMarkup(new InlineKeyboardButton
                {
                    Text = $"{@event.Task.Title}",
                    CallbackData = $"/taskinfo {@event.Task.Id}"
                });
                await _notificationsService.SendTelegramMessageAsync(notification, inlineKeyboard);
            }
        }
    }
}