using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class RegistrationRequestRejectedEventHandler : EventHandlerBase<RegistrationRequestRejectedEvent>
    {
        private readonly IEmailService _emailService;

        public RegistrationRequestRejectedEventHandler(IEmailService emailService)
        {
            _emailService = emailService;
        }
        
        public override async Task HandleAsync(RegistrationRequestRejectedEvent @event)
        {
            var reasonBlock = string.IsNullOrWhiteSpace(@event.RejectReason)
                ? string.Empty
                : $"<br/><br/>Причина отклонения: {@event.RejectReason}";

            var email = new Notification
            {
                Sender = "CourseService",
                Body = $"{@event.Name} {@event.Surname}, ваша заявка на регистрацию была отклонена. {reasonBlock}",
                Category = CategoryState.Profile
            };
            
            await _emailService.SendEmailAsync(email, @event.Email, "HwProj");
        }
    }
}