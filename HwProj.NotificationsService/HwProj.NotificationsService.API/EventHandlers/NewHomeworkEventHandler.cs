using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;
using HwProj.NotificationsService.API.Services;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.Models.AuthService.DTO;

namespace HwProj.NotificationsService.API.EventHandlers
{
    // ReSharper disable once UnusedType.Global
    public class NewHomeworkEventHandler : IEventHandler<NewHomeworkEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;

        public NewHomeworkEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService, IMapper mapper, IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _mapper = mapper;
            _authServiceClient = authServiceClient;
        }

        public async Task HandleAsync(NewHomeworkEvent @event)
        {
            foreach(var student in @event.Course.CourseMates)
            {
                var studentAccount = await _authServiceClient.GetAccountData(student.StudentId);
                var studentModel = _mapper.Map<AccountDataDto>(studentAccount);
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = $"В курсе <a href='courses/{@event.Course.Id}'>{@event.Course.Name}</a> опубликована новая домашняя работа <i>{@event.Homework}</i>.",
                    Category = "Домашние задания",
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = student.StudentId
                };
                await _notificationRepository.AddAsync(notification);
                await _notificationsService.SendEmailAsync(notification, studentModel.Email, "Домашняя работа");
            }
        }
    }
}