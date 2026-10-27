using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationsService.API.Repositories;
using HwProj.Models.AuthService.DTO;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Services;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class UpdateTaskMaxRatingEventHandler : EventHandlerBase<UpdateTaskMaxRatingEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public UpdateTaskMaxRatingEventHandler(
            INotificationsRepository notificationRepository,
            IMapper mapper,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _authServiceClient = authServiceClient;
            _emailService = emailService;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(UpdateTaskMaxRatingEvent @event)
        {
            var courseUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}";
            var taskUrl = $"{courseUrl}/homeworks?taskId={@event.TaskId}";

            var message = new NotificationMessage(CategoryState.Homeworks, "Задача обновлена")
                .WithSubject($"Задача «{@event.TaskTitle}» обновлена")
                .WithText($"В курсе {NotificationHtml.Link(courseUrl, @event.CourseName)} обновлена задача " +
                          $"{NotificationHtml.Link(taskUrl, @event.TaskTitle)}. Загляните, чтобы не пропустить изменения.")
                .WithAction("Открыть задачу", taskUrl);

            foreach (var student in @event.StudentIds)
            {
                var studentAccount = await _authServiceClient.GetAccountData(student);
                var studentModel = _mapper.Map<AccountDataDto>(studentAccount);

                var addNotificationTask = _notificationRepository.AddAsync(message.ToNotification(student, "CourseService"));
                var sendEmailTask = _emailService.SendEmailAsync(message, studentModel.Email, studentModel.Name);

                await Task.WhenAll(addNotificationTask, sendEmailTask);
            }
        }
    }
}
