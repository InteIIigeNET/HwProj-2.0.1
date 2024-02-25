using System;
using System.Linq;
using System.Threading.Tasks;
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
    public class NewHomeworkTaskEventHandler : EventHandlerBase<NewTaskEvent>
    {
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly INotificationsRepository _notificationRepository;
        private readonly IScheduleJobsRepository _scheduleJobsRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public NewHomeworkTaskEventHandler(
            ICoursesServiceClient coursesServiceClient,
            INotificationsRepository notificationRepository,
            IScheduleJobsRepository scheduleJobsRepository,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _coursesServiceClient = coursesServiceClient;
            _notificationRepository = notificationRepository;
            _scheduleJobsRepository = scheduleJobsRepository;
            _authServiceClient = authServiceClient;
            _emailService = emailService;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(NewTaskEvent @event)
        {
            if (@event.Task.PublicationDate <= DateTime.Now)
            {
                await AddNotificationsAsync(@event);
                return;
            }

            await EventHandlerExtensions<NewTaskEvent>.AddScheduleJobAsync(
                @event,
                @event.TaskId,
                @event.Task.PublicationDate,
                () => AddNotificationsAsync(@event),
                _scheduleJobsRepository
            );
        }

        // ReSharper disable once MemberCanBePrivate.Global
        public async Task AddNotificationsAsync(NewTaskEvent @event)
        {
            var course = await _coursesServiceClient.GetCourseById(@event.Course.Id);
            if (course == null) return;

            var studentIds = course.CourseMates.Select(t => t.StudentId).ToArray();
            var accountsData = await _authServiceClient.GetAccountsData(studentIds);

            var url = _configuration["Url"];
            var message = $"В курсе <a href='{url}/courses/{course.Id}'>{course.Name}</a>" +
                          $" опубликована новая задача <a href='{url}/task/{@event.TaskId}'>{@event.Task.Title}</a>." +
                          (@event.Task.DeadlineDate is { } deadline ? $"\n\nДедлайн: {deadline:U}" : "");

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
