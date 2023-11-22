using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Hangfire;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
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
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;
        private readonly IScheduleJobsRepository _scheduleJobsRepository;

        public UpdateTaskEventHandler(
            ICoursesServiceClient coursesServiceClient,
            INotificationsRepository notificationRepository,
            IMapper mapper,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration,
            IEmailService emailService,
            IScheduleJobsRepository scheduleJobsRepository)
        {
            _coursesServiceClient = coursesServiceClient;
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
            var course = await _coursesServiceClient.GetCourseById(@event.Course.Id);
            if (course == null) return;

            var studentIds = course.CourseMates.Select(t => t.StudentId).ToArray();
            var accountsData = await _authServiceClient.GetAccountsData(studentIds);

            var url = _configuration["Url"];
            var isTaskPublished = @event.PreviousEvent.PublicationDate < DateTimeUtils.GetMoscowNow();
            var message = isTaskPublished
                ? $"Задача <a href='{_configuration["Url"]}/task/{@event.TaskId}'>{@event.PreviousEvent.Title}</a>" +
                  $" из курса <a href='{_configuration["Url"]}/courses/{course.Id}'>{course.Name}</a> обновлена."
                : $"В курсе <a href='{url}/courses/{course.Id}'>{course.Name}</a>" +
                  $" опубликована новая задача <a href='{url}/task/{@event.TaskId}'>{@event.NewEvent.Title}</a>." +
                  (@event.NewEvent.DeadlineDate is { } deadline ? $"\n\nДедлайн: {deadline:U}" : "");

            foreach (var student in accountsData)
            {
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = message,
                    Category = CategoryState.Tasks,
                    Date = DateTimeUtils.GetMoscowNow(),
                    Owner = student!.UserId
                };

                var addNotificationTask = _notificationRepository.AddAsync(notification);
                var sendEmailTask = _emailService.SendEmailAsync(notification, student.Email, "Новая задача");

                await Task.WhenAll(addNotificationTask, sendEmailTask);
            }

            await EventHandlerExtensions<UpdateTaskEvent>.DeleteScheduleJobAsync(@event, @event.TaskId,
                _scheduleJobsRepository);
        }
    }
}