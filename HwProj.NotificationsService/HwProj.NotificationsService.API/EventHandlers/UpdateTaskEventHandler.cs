using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Events.CourseEvents;
using HwProj.Models;
using HwProj.Models.AuthService.DTO;
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
        private readonly IScheduleWorksRepository _scheduleWorksRepository;

        public UpdateTaskEventHandler(
            INotificationsRepository notificationRepository,
            IMapper mapper,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration,
            IEmailService emailService,
            IScheduleWorksRepository scheduleWorksRepository)
        {
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _authServiceClient = authServiceClient;
            _emailService = emailService;
            _configuration = configuration.GetSection("Notification");
            _scheduleWorksRepository = scheduleWorksRepository;
        }

        public override async Task HandleAsync(UpdateTaskEvent @event)
        {
            //TODO: event types
            var id = ScheduleWorkIdBuilder.Build(@event, @event.TaskId);
            
            foreach (var student in @event.Course.CourseMates)
            {
                var studentAccount = await _authServiceClient.GetAccountData(student.StudentId);
                var studentModel = _mapper.Map<AccountDataDto>(studentAccount);
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = $"Задача <a href='{_configuration["Url"]}/task/{@event.TaskId}'>{@event.TaskTitle}</a>" +
                           $" из курса <a href='{_configuration["Url"]}/courses/{@event.Course.Id}'>{@event.Course.Name}</a> обновлена.",
                    Category = CategoryState.Courses,
                    Date = DateTimeUtils.GetMoscowNow(),
                    HasSeen = false,
                    Owner = student.StudentId
                };

                var addNotificationTask = _notificationRepository.AddAsync(notification);
                var sendEmailTask = _emailService.SendEmailAsync(notification, studentModel.Email, "Домашняя работа");

                await Task.WhenAll(addNotificationTask, sendEmailTask);
            }
        }

        public async Task ScheduleWorkAsync()
        {
            
        }
    }
}
