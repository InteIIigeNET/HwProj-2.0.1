using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.API.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(Notification notification, string email, string topic);
    }
}