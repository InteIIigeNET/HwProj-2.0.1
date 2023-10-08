using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;
using HwProj.Models;
using Hangfire;
using HwProj.EventBus.Client;
using HwProj.NotificationsService.API.Services;
using Microsoft.Azure.KeyVault.Models;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class NewHomeworkTaskEventHandler : ScheduleEventHandlerBase<NewHomeworkTaskEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IScheduleWorksRepository _scheduleWorksRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public NewHomeworkTaskEventHandler(
            INotificationsRepository notificationRepository,
            IScheduleWorksRepository scheduleWorksRepository,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _scheduleWorksRepository = scheduleWorksRepository;
            _authServiceClient = authServiceClient;
            _emailService = emailService;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(NewHomeworkTaskEvent @event)
        {
            var jobId = BackgroundJob.Schedule(() => ScheduleWorkAsync(@event),
                @event.PublicationDate.Subtract(TimeSpan.FromHours(3)));

            var scheduleWork = new ScheduleWork
            {
                Id = @event.TaskId,
                JobId = jobId,
                Type = typeof(NewHomeworkTaskEvent)
            };

            await _scheduleWorksRepository.AddAsync(scheduleWork);
        }

        
        protected override async Task ScheduleWorkAsync(NewHomeworkTaskEvent @event)
        {
            var studentIds = @event.Course.CourseMates.Select(t => t.StudentId).ToArray();
            var accountsData = await _authServiceClient.GetAccountsData(studentIds);
            var url = _configuration["Url"];

            foreach (var student in accountsData)
            {
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body =
                        $"В курсе <a href='{url}/courses/{@event.Course.Id}'>{@event.Course.Name}</a>" +
                        $" опубликована новая задача <a href='{url}/task/{@event.TaskId}'>{@event.TaskTitle}</a>." +
                        (@event.Deadline is { } deadline ? $"\n\nДедлайн: {deadline:U}" : ""),

                    Category = CategoryState.Homeworks,
                    Date = DateTimeUtils.GetMoscowNow(),
                    Owner = student!.UserId
                };

                var addNotificationTask = _notificationRepository.AddAsync(notification);
                var sendEmailTask = _emailService.SendEmailAsync(notification, student.Email, "Новая задача");

                await Task.WhenAll(addNotificationTask, sendEmailTask);
            }
        }
    }
}
