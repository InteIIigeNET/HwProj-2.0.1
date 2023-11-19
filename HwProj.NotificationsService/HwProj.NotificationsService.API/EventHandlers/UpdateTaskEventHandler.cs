using System;
using System.Threading.Tasks;
using AutoMapper;
using Hangfire;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.Events.CourseEvents;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class UpdateTaskEventHandler : EventHandlerBase<UpdateTaskEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;
        private readonly IScheduleJobsRepository _scheduleJobsRepository;

        public UpdateTaskEventHandler(
            INotificationsRepository notificationRepository,
            IMapper mapper,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration,
            IEmailService emailService,
            IScheduleJobsRepository scheduleJobsRepository)
        {
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _authServiceClient = authServiceClient;
            _emailService = emailService;
            _configuration = configuration.GetSection("Notification");
            _scheduleJobsRepository = scheduleJobsRepository;
        }

        public override async Task HandleAsync(UpdateTaskEvent @event)
        {
            if (@event.PreviousEvent.PublicationDate <= DateTimeUtils.GetMoscowNow())
            {
                await AddNotificationsAsync(@event);
                return;
            }

            await EventHandlerExtensions<UpdateTaskEvent>.UpdateScheduleJobAsync(@event, @event.TaskId,
                @event.NewEvent.PublicationDate,
                () => AddNotificationsAsync(@event), _scheduleJobsRepository);
        }

        public async Task AddNotificationsAsync(UpdateTaskEvent @event)
        {
            var url = _configuration["Url"];
            var isTaskPublished = @event.PreviousEvent.PublicationDate < DateTimeUtils.GetMoscowNow();
            var message = isTaskPublished
                ? $"Задача <a href='{_configuration["Url"]}/task/{@event.TaskId}'>{@event.PreviousEvent.Title}</a>" +
                  $" из курса <a href='{_configuration["Url"]}/courses/{@event.Course.Id}'>{@event.Course.Name}</a> обновлена."
                : $"В курсе <a href='{url}/courses/{@event.Course.Id}'>{@event.Course.Name}</a>" +
                  $" опубликована новая задача <a href='{url}/task/{@event.TaskId}'>{@event.NewEvent.Title}</a>." +
                  (@event.NewEvent.DeadlineDate is { } deadline ? $"\n\nДедлайн: {deadline:U}" : "");

            foreach (var student in @event.Course.CourseMates)
            {
                var studentAccount = await _authServiceClient.GetAccountData(student.StudentId);
                var studentModel = _mapper.Map<AccountDataDto>(studentAccount);
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = message,
                    Category = CategoryState.Courses,
                    Date = DateTimeUtils.GetMoscowNow(),
                    HasSeen = false,
                    Owner = student.StudentId
                };

                var addNotificationTask = _notificationRepository.AddAsync(notification);
                var sendEmailTask = _emailService.SendEmailAsync(notification, studentModel.Email, "Домашняя работа");

                await Task.WhenAll(addNotificationTask, sendEmailTask);
            }
            
            await EventHandlerExtensions<UpdateTaskEvent>.DeleteScheduleJobAsync(@event, @event.TaskId,
                _scheduleJobsRepository);
        }
    }
}