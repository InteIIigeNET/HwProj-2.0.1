using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.SolutionsService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Services;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class StudentPassTaskEventHandler : EventHandlerBase<StudentPassTaskEvent>
    {
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;
        private readonly INotificationSettingsService _settingsService;

        public StudentPassTaskEventHandler(
            IAuthServiceClient authServiceClient,
            IConfiguration configuration,
            IEmailService emailService,
            INotificationSettingsService settingsService)
        {
            _authServiceClient = authServiceClient;
            _emailService = emailService;
            _settingsService = settingsService;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(StudentPassTaskEvent @event)
        {
            var url = _configuration["Url"];
            var solutionsUrl = $"{url}/task/{@event.Task.Id}/{@event.Student.UserId}";
            var courseUrl = $"{url}/courses/{@event.Course.Id}";
            var studentName = NotificationHtml.FullName(@event.Student.Name, @event.Student.Surname);

            var message = new NotificationMessage(CategoryState.Homeworks, "Новое решение на проверку")
                .WithSubject($"{studentName}: решение задачи «{@event.Task.Title}»")
                .WithText($"{NotificationHtml.Encode(studentName)} отправил(а) решение задачи " +
                          $"{NotificationHtml.Link(solutionsUrl, @event.Task.Title)}.")
                .WithDetail("Курс", NotificationHtml.Link(courseUrl, @event.Course.Name));
            if (NotificationHtml.IsWebUrl(@event.Solution.GithubUrl))
                message.WithDetail("Решение", NotificationHtml.ExternalLink(@event.Solution.GithubUrl, "Открыть ссылку"));
            message
                .WithQuote("Комментарий студента", @event.Solution.Comment)
                .WithAction("Проверить решение", solutionsUrl);

            foreach (var mentorId in @event.Course.MentorIds)
            {
                var setting = await _settingsService.GetAsync(mentorId,
                    NotificationsSettingCategory.NewSolutionsCategory);
                if (!setting.IsEnabled) continue;

                var mentor = await _authServiceClient.GetAccountData(mentorId);

                await _emailService.SendEmailAsync(message, mentor.Email, mentor.Name);
            }
        }
    }
}
