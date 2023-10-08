using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers;

public class ConfirmationEmailEventHandler : EventHandlerBase<EmailConfirmationEvent>
{
    private readonly IConfiguration _configuration;
    private readonly INotificationsRepository _notificationsRepository;
    private readonly IEmailService _emailService;

    public ConfirmationEmailEventHandler(IConfiguration configuration, INotificationsRepository notificationsRepository, IEmailService emailService)
    {
        _configuration = configuration;
        _notificationsRepository = notificationsRepository;
        _emailService = emailService;
    }

    public override async Task HandleAsync(EmailConfirmationEvent @event)
    {
        var frontendUrl = _configuration.GetSection("Notification")["Url"];
        var confirmationLink = $"{frontendUrl}/emailConfirmation?={@event.UserId}&{@event.EmailConfirmationToken}";
        var emailNotification = new Notification
        {
            Sender = "AuthService",
            Body = $"<a href={confirmationLink}>Click</a>",
            Category = CategoryState.Profile,
            Date = DateTimeUtils.GetMoscowNow(),
            HasSeen = false,
            Owner = @event.UserId
        };
        var email = new Notification
        {
            Sender = "AuthService",
            Body = $"<a href={confirmationLink}>Click</a>",
            Category = CategoryState.Profile,
            Date = DateTimeUtils.GetMoscowNow(),
            HasSeen = false,
            Owner = @event.UserId
        };
        var addNotification = _notificationsRepository.AddAsync(emailNotification);
        var sendEmail = _emailService.SendEmailAsync(emailNotification, @event.Email, "HwProj");
        await Task.WhenAll(addNotification, sendEmail);
    }
}