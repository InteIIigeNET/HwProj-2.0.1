using System;
using System.Diagnostics.Tracing;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.Events.CourseEvents;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Jobs;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class AddOrUpdateTaskEventHandler : EventHandlerBase<AddOrUpdateTaskEvent>
    {
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;
        private readonly IScheduleJobsRepository _scheduleJobsRepository;

        public AddOrUpdateTaskEventHandler(
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

        public override async Task HandleAsync(AddOrUpdateTaskEvent @event)
        {
            //TODO : ленивость не работает
            var task = await _coursesServiceClient.GetTask(@event.TaskId);
            
            if (task.PublicationDate <= DateTime.UtcNow)
            {
                await AddNotificationsAsync(@event);
            }
            else if (@event.IsUpdate)
            {
                await EventHandlerExtensions<AddOrUpdateTaskEvent>.UpdateScheduleJobAsync(@event, @event.TaskId,
                    task.PublicationDate, () => AddNotificationsAsync(@event), _scheduleJobsRepository);
            }
            else
            {
                await EventHandlerExtensions<AddOrUpdateTaskEvent>.AddScheduleJobAsync(@event, @event.TaskId,
                    task.PublicationDate, () => AddNotificationsAsync(@event), _scheduleJobsRepository);
            }
        }

        public async Task AddNotificationsAsync(AddOrUpdateTaskEvent @event)
        {
            var course = await _coursesServiceClient.GetCourseByTask(@event.TaskId);
            var task = await _coursesServiceClient.GetTask(@event.TaskId);
            if (course == null) return;

            var studentIds = course.CourseMates.Select(t => t.StudentId).ToArray();
            var accountsData = await _authServiceClient.GetAccountsData(studentIds);

            var url = _configuration["Url"];
            var message = task.PublicationDate < DateTime.UtcNow
                ? $"Задача <a href='{url}/task/{@event.TaskId}'>{task.Title}</a>" +
                  $" из курса <a href='{url}/courses/{course.Id}'>{course.Name}</a> обновлена."
                : $"В курсе <a href='{url}/courses/{course.Id}'>{course.Name}</a>" +
                  $" опубликована новая задача <a href='{url}/task/{@event.TaskId}'>{task.Title}</a>." +
                  (task.DeadlineDate is { } deadline ? $"\n\nДедлайн: {deadline:U}" : "");

            foreach (var student in accountsData)
            {
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = message,
                    Category = CategoryState.Homeworks,
                    Date = DateTime.UtcNow,
                    Owner = student.UserId
                };

                var addNotificationTask = _notificationRepository.AddAsync(notification);
                var sendEmailTask = _emailService.SendEmailAsync(notification, student.Email, "Новая задача");

                await Task.WhenAll(addNotificationTask, sendEmailTask);
            }
        }
    }
}