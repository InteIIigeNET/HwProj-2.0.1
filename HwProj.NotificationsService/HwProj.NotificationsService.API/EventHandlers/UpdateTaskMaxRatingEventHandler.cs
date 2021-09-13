using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;
using HwProj.NotificationsService.API.Services;
using HwProj.AuthService.Client;
using AutoMapper;
using HwProj.Models.AuthService.DTO;

namespace HwProj.NotificationsService.API.EventHandlers
{
    // ReSharper disable once UnusedType.Global
    public class UpdateTaskMaxRatingEventHandler : IEventHandler<UpdateTaskMaxRatingEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;

        public UpdateTaskMaxRatingEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService, IMapper mapper, IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _mapper = mapper;
            _authServiceClient = authServiceClient;
        }

        public async Task HandleAsync(UpdateTaskMaxRatingEvent @event)
        {
            foreach (var student in @event.Course.CourseMates)
            {
                var studentAccount = await _authServiceClient.GetAccountData(student.StudentId);
                var studentModel = _mapper.Map<AccountDataDto>(studentAccount);
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = $"<a href='task/{@event.Task.Id}'>Задача</a> обновлена.",
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