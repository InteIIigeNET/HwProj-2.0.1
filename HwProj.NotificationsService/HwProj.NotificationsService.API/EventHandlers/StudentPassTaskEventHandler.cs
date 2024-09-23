using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.SolutionsService.API.Events;
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
            var body = $"{@event.Student.Name} {@event.Student.Surname} добавил новое " +
                       $"<a href='{@event.Solution.GithubUrl}' target='_blank'>решение</a>" +
                       $" задачи <a href='{_configuration["Url"]}/task/{@event.Task.Id}/{@event.Student.UserId}'>{@event.Task.Title}</a>" +
                       $" из курса <a href='{_configuration["Url"]}/courses/{@event.Course.Id}'>{@event.Course.Name}</a>.";

            foreach (var mentorId in @event.Course.MentorIds)
            {
                var setting = await _settingsService.GetAsync(mentorId,
                    NotificationsSettingCategory.NewSolutionsCategory);
                if (!setting.IsEnabled) continue;

                var notification = new Notification
                {
                    Sender = "SolutionService",
                    Body = body,
                    Category = CategoryState.Homeworks,
                    Date = @event.CreationData,
                    HasSeen = false,
                    Owner = mentorId
                };

                var subject = $"Новое решение задачи {@event.Task.Title}";
                var mentor = await _authServiceClient.GetAccountData(notification.Owner);

                await _emailService.SendEmailAsync(notification, mentor.Email, subject);
            }
        }
    }
}
