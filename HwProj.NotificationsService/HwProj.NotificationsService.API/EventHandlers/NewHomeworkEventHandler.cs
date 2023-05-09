using System.Linq;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.CoursesService.API.Events;
using HwProj.Models;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers;

public class NewHomeworkEventHandler : EventHandlerBase<NewHomeworkEvent>
{
    private readonly INotificationsRepository _notificationRepository;
    private readonly IAuthServiceClient _authServiceClient;
    private readonly IConfigurationSection _configuration;
    private readonly IEmailService _emailService;

    public NewHomeworkEventHandler(
        INotificationsRepository notificationRepository,
        IAuthServiceClient authServiceClient,
        IConfiguration configuration,
        IEmailService emailService)
    {
        _notificationRepository = notificationRepository;
        _authServiceClient = authServiceClient;
        _emailService = emailService;
        _configuration = configuration.GetSection("Notification");
    }

    public override async Task HandleAsync(NewHomeworkEvent @event)
    {
        var studentIds = @event.Course.CourseMates.Select(t => t.StudentId).ToArray();
        var accountsData = await _authServiceClient.GetAccountsData(studentIds);

        foreach (var student in accountsData)
        {
            var notification = new Notification
            {
                Sender = "CourseService",
                Body =
                    $"В курсе <a href='{_configuration["Url"]}/courses/{@event.Course.Id}'>{@event.Course.Name}</a>" +
                    $" опубликована новая домашняя работа <i>{@event.Homework}</i>.",
                Category = CategoryState.Homeworks,
                Date = DateTimeUtils.GetMoscowNow(),
                HasSeen = false,
                Owner = student!.UserId
            };

            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, student.Email, "Домашняя работа");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}