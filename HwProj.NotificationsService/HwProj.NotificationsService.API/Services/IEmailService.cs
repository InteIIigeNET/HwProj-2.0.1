using System.Threading.Tasks;
using HwProj.NotificationsService.API.Services.Messages;

namespace HwProj.NotificationsService.API.Services
{
    public interface IEmailService
    {
        /// <param name="recipientName">Имя для приветствия в письме; без него письмо начинается сразу с текста</param>
        Task SendEmailAsync(NotificationMessage message, string email, string recipientName = null);
    }
}
