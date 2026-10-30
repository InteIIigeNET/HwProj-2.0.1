using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services.Digest;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class TaskQuestionAnsweredEventHandler : IEventHandler<TaskQuestionAnsweredEvent>
    {
        private const int MaxQuestionLength = 200;

        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;

        public TaskQuestionAnsweredEventHandler(
            INotificationsRepository notificationRepository,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration)
        {
            _notificationRepository = notificationRepository;
            _authServiceClient = authServiceClient;
            _configuration = configuration.GetSection("Notification");
        }

        public async Task HandleAsync(TaskQuestionAnsweredEvent @event)
        {
            var lecturer = await _authServiceClient.GetAccountData(@event.LecturerId);
            var taskUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}/homeworks?taskId={@event.TaskId}";
            var lecturerName = NotificationHtml.FullName(lecturer.Name, lecturer.Surname);

            var message = new NotificationMessage(CategoryState.Homeworks, "Ответ на вопрос")
                .WithSubject($"Ответ на вопрос по задаче «{@event.TaskTitle}»")
                .WithText($"Преподаватель {NotificationHtml.Encode(lecturerName)} ответил на ваш вопрос по задаче" +
                          $" {NotificationHtml.Link(taskUrl, @event.TaskTitle)}.")
                .WithDetail("Вопрос", NotificationHtml.Encode(NotificationHtml.Truncate(@event.Question, MaxQuestionLength)))
                .WithQuote("Ответ", @event.Answer)
                .WithAction("Открыть задачу", taskUrl)
                .WithDigest(new DigestItem
                {
                    Kind = DigestItemKind.TaskQuestionAnswered,
                    CourseId = @event.CourseId,
                    CourseName = @event.CourseName,
                    TaskId = @event.TaskId,
                    TaskTitle = @event.TaskTitle,
                    Question = @event.Question,
                    Answer = @event.Answer
                });

            await _notificationRepository.AddAsync(message.ToNotification(@event.StudentId, "CourseService"));
        }
    }
}
