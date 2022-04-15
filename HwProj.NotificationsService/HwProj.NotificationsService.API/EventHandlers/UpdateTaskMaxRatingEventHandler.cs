using System;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;
using HwProj.Models.AuthService.DTO;
using HwProj.NotificationsService.API.Services;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class UpdateTaskMaxRatingEventHandler : IEventHandler<UpdateTaskMaxRatingEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;


        public UpdateTaskMaxRatingEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService, IAuthServiceClient authServiceClient, IMapper mapper)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _authServiceClient = authServiceClient;
            _mapper = mapper;
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
                var studentAccount = await _authServiceClient.GetAccountData(student.StudentId);
                var studentModel = _mapper.Map<AccountDataDto>(studentAccount);
                await _notificationsService.SendEmailAsync(notification, studentModel.Email, "Домашняя работа");
                
                notification.Body = $"Задача {@event.Task.Title} из {@event.Course.Name} обновлена.";// клава
                var inlineKeyboard = new InlineKeyboardMarkup(new InlineKeyboardButton
                {
                    Text = $"{@event.Task.Title}",
                    CallbackData = $"/taskinfo {@event.Task.Id}"
                });
                await _notificationsService.SendTelegramMessageWithKeyboardAsync(notification, inlineKeyboard);
            }
        }
    }
}