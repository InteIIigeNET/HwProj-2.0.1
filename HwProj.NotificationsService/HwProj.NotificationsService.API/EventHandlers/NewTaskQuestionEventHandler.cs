using System.Linq;
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
    /// <summary> Вопрос получают только преподаватели, которым студент виден по фильтрам курса </summary>
    public class NewTaskQuestionEventHandler : IEventHandler<NewTaskQuestionEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;

        public NewTaskQuestionEventHandler(
            INotificationsRepository notificationRepository,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration)
        {
            _notificationRepository = notificationRepository;
            _authServiceClient = authServiceClient;
            _configuration = configuration.GetSection("Notification");
        }

        public async Task HandleAsync(NewTaskQuestionEvent @event)
        {
            if (!@event.MentorIds.Any()) return;

            var student = await _authServiceClient.GetAccountData(@event.StudentId);
            var url = _configuration["Url"];
            var taskUrl = $"{url}/courses/{@event.CourseId}/homeworks?taskId={@event.TaskId}";
            var studentName = NotificationHtml.FullName(student.Name, student.Surname);

            var message = new NotificationMessage(CategoryState.Homeworks, "Новый вопрос по задаче")
                .WithSubject($"{studentName}: вопрос по задаче «{@event.TaskTitle}»")
                .WithText($"Студент {NotificationHtml.Link($"{url}/profile/{@event.StudentId}", studentName)}" +
                          $" задал {(@event.IsPrivate ? "приватный " : "")}вопрос по задаче" +
                          $" {NotificationHtml.Link(taskUrl, @event.TaskTitle)}.")
                .WithDetail("Курс", NotificationHtml.Encode(@event.CourseName))
                .WithQuote("Вопрос", @event.Text)
                .WithAction("Ответить", taskUrl)
                .WithDigest(new DigestItem
                {
                    Kind = DigestItemKind.NewTaskQuestion,
                    CourseId = @event.CourseId,
                    CourseName = @event.CourseName,
                    TaskId = @event.TaskId,
                    TaskTitle = @event.TaskTitle,
                    StudentId = @event.StudentId,
                    StudentName = studentName
                });

            await _notificationRepository.AddRangeAsync(@event.MentorIds
                .Select(mentorId => message.ToNotification(mentorId, "CourseService")));
        }
    }
}
