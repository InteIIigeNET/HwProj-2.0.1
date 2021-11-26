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
    public class UpdateHomeworkEventHandler : IEventHandler<UpdateHomeworkEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;

        public UpdateHomeworkEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
        }

        public async Task HandleAsync(UpdateHomeworkEvent @event)
        {
            foreach (var student in @event.Course.CourseMates)
            {
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = $"В курсе <a href='courses/{@event.Course.Id}'>{@event.Course.Name}</a>" +
                           $" домашнее задание <i>{@event.Homework.Title}</i> обновлено.",
                    Category = "CourseService",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = student.StudentId
                };
                await _notificationRepository.AddAsync(notification);
                notification.Body = $"В курсе {@event.Course.Name} домашнее задание {@event.Homework.Title} обновлено.";// клава
                var inlineKeyboard = new InlineKeyboardMarkup(new InlineKeyboardButton
                {
                    Text = $"{@event.Homework.Title}",
                    CallbackData = $"/task {@event.Homework.Id}"
                });
                await _notificationsService.SendTelegramMessageAsync(notification, inlineKeyboard);
            }
        }
    }
}